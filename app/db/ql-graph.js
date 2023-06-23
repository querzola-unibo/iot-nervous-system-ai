
const { collection, Id } = require('.')
const moment = require('moment')
const { normalizeId } = require('./utils/ids')
const QLGraph = collection('ql-graph-test2-lambda-25')

const getCurrentTime = () => {
	const date = moment(Date.now())

	return Math.floor(date.hour() / 6)
}

const getMatchingStates = async (status) => {
	const query = {
		time: getCurrentTime()
	}

	query['$and'] = mapRooms(status).map(room => {
		const query = {rooms: {}}
		query.rooms['$elemMatch'] = room

		return query
	})

	return QLGraph.find(query).toArray()
}

const getState = async (_id) => {
	const query = { _id: normalizeId(_id) }

	const states = await QLGraph.find(query).toArray()

	return states[0]
}

const createState = async (status) => {
	const newState = getStateFromStatus(status)

	newState.time = getCurrentTime()

	return QLGraph.insertOne(newState)
}

const updateState = async ({ _id, ...fieldsToUpdate }) => {
	const query = { _id: normalizeId(_id) }

  return QLGraph.findOneAndUpdate(
    query,
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const removeState = async ({ _id }) => {
	const query = { _id: normalizeId(_id) }


  return QLGraph.deleteOne(query)
}

const getStateFromStatus = (status) => {
	const newState = {}

	newState.rooms = mapRooms(status)
	newState.actions = mapActions(status)

	return newState
}

const mapActions = (status) => {
	const actions = [{ topic: null, qValue: 0 }]

	return status.devices.reduce((acc, curr) => {
		curr.actuators.forEach(({ key, type, ...actuator}) => {
			if(type === 'range') {
				const stepSize = actuator.step || actuator.threshold
				const steps = (actuator.max - actuator.min) / stepSize

				for (let i = 0; i <= steps; i++) {
					acc.push({ topic: `${curr.deviceId}/${key}/${(i + actuator.min) * stepSize}`, qValue: 0 })
				}
			} else if(type === 'boolean'){
				acc.push({ topic: `${curr.deviceId}/${key}/true`, qValue: 0 })
				acc.push({ topic: `${curr.deviceId}/${key}/false`, qValue: 0 })
			}
		});
		return acc
	}, actions)
}

const mapRooms = (status) => {
	return status.rooms.map(({ _id, deviceIds }) => {
		const devices = status.devices.filter(d => deviceIds.includes(d._id.toString()))
		const room = { _id: _id.toString() }

		return devices.reduce((acc, curr) => {
			const keys = Object.keys(curr.params)

			keys.forEach(k => {
				const device = [...curr.actuators, ...curr.sensors].find(({ key }) => k === key)
				if(device){
						if(device.threshold) {
							acc[k] = curr.params[k] - (curr.params[k] % device.threshold)
						} else {
							acc[k] = curr.params[k]
						}
						return
				}
			})
	
			return acc
		}, room)
	})
}

const updateQValue = async ({ stateId, topic, newQValue }) => {
	const state = await getState(stateId)

	const updatedActions = 	state.actions.map((a) => {
		if(a.topic !== topic) {
			return a
		} 
		return { ...a, qValue: newQValue}
	})

	await updateState({_id: stateId, actions: updatedActions })

}

module.exports = {
	getMatchingStates, 
	createState,
	getState,
	getStateFromStatus,
	updateQValue
}