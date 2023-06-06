const { getMatchingStates, createState, getState, updateQValue } = require('../db/ql-graph')
const Devices = require('../db/devices')
const Rooms = require('../db/rooms')
const Routines = require('../db/routines')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')
const { epsilon, gamma, alpha } = require('./utils/costants')
const { getRangeReward, getTimeRangeReward, getBooleanReward } = require('./utils/rewards')

const getCurrentState = async (status) => {
	const states = await getMatchingStates(status)

	if(!states.length) {
		const newState = await createState(status)

		return getState(newState.insertedId)
	}

	//handle
	if(states.length > 1) {
		console.log(`Found ${states.length} states for status: \n${JSON.stringify(status, null, 2)}`)
	}

	return states[0]
}

const calculateAction = (currentState) => {
	const actions = currentState.actions
	
	if (!actions.length){
		return null
	}

	const randomicThreshold = epsilon * 100
	const random = Math.floor((Math.random() * randomicThreshold))

	if (random > randomicThreshold){
		let bestActions = []
		let maxQValue = null

		actions.forEach(action => {
			if (!maxQValue || action.qValue > maxQValue) {
				bestActions = [action]
				maxQValue = action.qValue
			} else if (action.qValue === maxQValue) {
				bestActions.push(action)
				maxQValue = action.qValue
			}
		})

		

		return bestActions[0]
	} else {
		const randomIndex = Math.floor((Math.random() * actions.length))
		return actions[randomIndex]
	}
}

const calculateRoutineReward = (rules, stateTime, room, devices) => {
	let reward = 0
	rules.forEach((({ param, type, ruleProps }) => {
		if (type === 'timeRange') {
			reward += getTimeRangeReward(ruleProps, stateTime)
		} else if (type === 'boolean'){
			reward += getBooleanReward(ruleProps, room[param])
		} else if (type === 'range') {
			const rangeProps = devices.reduce((acc, curr) => {
				const matchingParam = [...curr.sensors, ...curr.actuators].find(s => s.key === param)
				if(matchingParam) {
					return matchingParam
				}

				return acc
			}, {})
			reward += getRangeReward(ruleProps, rangeProps, room[param])
		}
	}))

	return reward
}

const calculateReward = async (currentState, status) => {
	const routines = await Routines.get()

	let reward = 0

	routines.forEach(routine => {	
		const {roomId, conditions, achievements, weight} = routine
		
		const room = currentState.rooms.find(r => r._id.toString() === roomId)
		const deviceIds = status.rooms.find(r => r._id === roomId).deviceIds
		const devices = status.devices.filter(d => deviceIds.includes(d._id))

		if((calculateRoutineReward(conditions, currentState.time, room, devices) / conditions.length) === 1) {
			const routineReward = calculateRoutineReward(achievements, currentState.time, room, devices)
			reward += routineReward * (weight / 10)
		}
	})

	return reward
}

const calculateMaxQ = ({ actions }) => {
	let maxQ = null

		actions.forEach(action => {
			if (action.qValue > maxQ) {
				maxQ = action.qValue
			}
		})
		
		return maxQ
}

const updateQLGraph = async ({ qValue, stateId, topic }) => {
	const status = {
		rooms: await Rooms.get(), 
		devices: await Devices.get(),
	}

	const currentState = await getCurrentState(status)
	const reward = await calculateReward(currentState, status)
	const maxQ = calculateMaxQ(currentState)

	const tdError = reward + (gamma * maxQ) + qValue
	const newQValue = qValue + (alpha * tdError)

	await updateQValue({ stateId, topic, newQValue })
}

const qLearning = async (client) => {
	const status = {
		rooms: await Rooms.get(), 
    devices: await Devices.get(),
	}

	if(!status.devices.length) {
		return
	}

	const currentState = await getCurrentState(status)
	const { qValue, topic } = calculateAction(currentState)
	console.log(`${MQTT_ROOT_TOPIC}/${topic}`)

	if(topic){
		client.publish(`${MQTT_ROOT_TOPIC}/${topic}`, JSON.stringify({}))
	}

	setTimeout(updateQLGraph, 10000, { qValue, stateId: currentState._id, topic })
}

module.exports = {
	qLearning,
	getCurrentState,
	calculateAction,
	calculateMaxQ,
	updateQLGraph,
	calculateReward
}