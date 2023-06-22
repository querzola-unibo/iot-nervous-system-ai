const { getMatchingStates, createState, getState, updateQValue } = require('../db/ql-graph')
const Devices = require('../db/devices')
const Rooms = require('../db/rooms')
const Routines = require('../db/routines')
const { createActivity } = require('../db/ql-timeline')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')
const { epsilon, gamma, alpha, lambda } = require('./utils/costants')
const { getRangeReward, getBooleanReward, isRangeSatisfied, isBooleanSatisfied, isTimeRangeSatisfied } = require('./utils/rewards')

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

const calculateAction = (currentState, devices) => {
	const actions = currentState.actions

	if (!actions.length){
		return {}
	}

	const unavailableActions = devices.reduce((acc,curr) => {
		curr.actuators.forEach(({key}) => {
			acc.push(`${curr.deviceId}/${key}/${curr.params[key]}`)
		})
		return acc
	}, [])

	const availableActions = actions.filter(a => !unavailableActions.includes(a.topic))
	console.log(availableActions)
	if (!availableActions.length){
		return {}
	}

	const randomicThreshold = epsilon * 100
	const random = Math.floor((Math.random() * 100))

	if (random > randomicThreshold){
		let bestActions = []
		let maxQValue = null

		availableActions.forEach(action => {
			if (typeof maxQValue === null || action.qValue > maxQValue) {
				bestActions = [action]
				maxQValue = action.qValue
			} else if (action.qValue === maxQValue) {
				bestActions.push(action)
				maxQValue = action.qValue
			}
		})

		if(bestActions.length === 1) {
			return {action: bestActions[0], isRandomAction: false}
		}
		const randomIndex = Math.floor((Math.random() * bestActions.length))
		return {action: bestActions[randomIndex], isRandomAction: false}

	} else {
		const randomIndex = Math.floor((Math.random() * availableActions.length))
		return {action: availableActions[randomIndex], isRandomAction: true}
	}
}

const isRoutineActive = (rules, stateTime, room, devices) => {
	return !rules.some((({ param, type, ruleProps }) => {
		if (type === 'timeRange') {
			return !isTimeRangeSatisfied(ruleProps, stateTime)
		} else if (type === 'boolean'){
			return !isBooleanSatisfied(ruleProps, room[param])
		} else if (type === 'range') {
			const rangeProps = devices.reduce((acc, curr) => {
				const matchingParam = [...curr.sensors, ...curr.actuators].find(s => s.key === param)
				if(matchingParam) {
					return matchingParam
				}

				return acc
			}, {})
			return !isRangeSatisfied(ruleProps, rangeProps, room[param])
		}
	}))
}

const calculateRoutineReward = (rules, room, devices) => {
	let reward = 0

	rules.forEach((({ param, type, ruleProps }) => {
		if (type === 'boolean'){
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

	reward /= rules.length

	return reward
}

const calculateRoutinesReward = async (currentState, status) => {
	const routines = await Routines.get()

	let routinesReward = 0

	const activeRoutines = routines.filter(({ roomId, conditions }) => {		
		const room = currentState.rooms.find(r => r._id.toString() === roomId)
		const deviceIds = status.rooms.find(r => r._id.toString() === roomId).deviceIds
		const devices = status.devices.filter(d => deviceIds.includes(d._id))

		if(isRoutineActive(conditions, currentState.time, room, devices)) {
			return true
		}

		return false
	})

	activeRoutines.forEach(routine => {	
		const { roomId, achievements, weight } = routine
		
		const room = currentState.rooms.find(r => r._id.toString() === roomId)
		const deviceIds = status.rooms.find(r => r._id.toString() === roomId).deviceIds
		const devices = status.devices.filter(d => deviceIds.includes(d._id.toString()))

		
		routinesReward = calculateRoutineReward(achievements, room, devices)
		routinesReward += routinesReward * (weight / 10)
	})

	return routinesReward / (activeRoutines?.length || 1)
}

const calculateEnergyReward = (status) => {
	let energyConsumes = 0

	status.devices.forEach(d => {
		d.actuators.forEach(a => {
			if(a.kWh && d.params[a.key] === true){
				energyConsumes += a.kWh
			}
		})
	})

	return -(((energyConsumes / 10) * 2) - 1)
}

const calculateReward = async (currentState, status) => {
	const routinesReward = await calculateRoutinesReward(currentState, status)

	const energyReward = calculateEnergyReward(status)

	const reward = lambda * routinesReward + ((1 - lambda) * energyReward)

	return { reward, routinesReward, energyReward }
}

const calculateMaxQ = ({ actions }) => {
	let maxQ = 0
	actions.forEach((action, index) => {
		if(!index) {
			maxQ = action.qValue
		} else if (action.qValue > maxQ) {
			maxQ = action.qValue
		}
	})
		
	return maxQ
}

const updateQLGraph = async ({ qValue, stateId, topic, isRandomAction }) => {
	const status = {
		rooms: await Rooms.get(), 
		devices: await Devices.get(),
	}

	const currentState = await getCurrentState(status)
	const { reward, routinesReward, energyReward } = await calculateReward(currentState, status)
	const maxQ = calculateMaxQ(currentState)

	const tdError = reward + (gamma * maxQ) + qValue
	const newQValue = qValue + (alpha * tdError)

	await createActivity({
		initialState: stateId,
		finalState: currentState._id,
		action: topic,
		isRandomAction,
  	energyReward,
  	routinesReward,
		maxQ,
  	finalReward: reward,
		initialQValue: qValue,
		finalQValue: newQValue,
  	lambda,
  	epsilon,
		gamma,
		alpha
	})
	
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
	const { action, isRandomAction } = calculateAction(currentState, status.devices)
	if(!action) {
		return
	}
	const { qValue, topic } = action

	if(topic){
		client.publish(`${MQTT_ROOT_TOPIC}/${topic}`, JSON.stringify({}))
	}

	setTimeout(updateQLGraph, 15000, { qValue, stateId: currentState._id, topic, isRandomAction })
}

module.exports = {
	qLearning,
	getCurrentState,
	calculateAction,
	calculateMaxQ,
	updateQLGraph,
	calculateReward
}