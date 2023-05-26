const test = require('ava')
const { collection } = require('../../db')
const { createState } = require('../../db/ql-graph')

const {
	qLearning,
	getCurrentState,
	calculateAction,
	calculateMaxQ,
	updateQLGraph,
	calculateReward
} = require('../../qlearning')
const { getStatus } = require('../utils/status')

const QLGraph = collection('ql-graph')

test.beforeEach(async () => {
  await QLGraph.deleteMany({})
})

const routines = [
	{
		"_id": "6462331453445119a4ab7c3c",
		"name": "Morning light",
		"roomId": "6454e5fa9969b261acbc6362",
		"from": 7,
		"to": 11,
		"condition": "brightness",
		"operator": "ABOVE" ,
		"values": [3500]
	},
	{
		"_id": "6462367b53445119a4ab7c3d",
		"name": "Night temperature",
		"roomId": null,
		"from": 21,
		"to": 6,
		"condition": "temperature",
		"operator": "BETWEEN",
		"values": [19, 21]
	}
]

test('getCurrentState - should not found any state and return a new created state', async t => {
	const status = getStatus()

  const result = await getCurrentState(status)

	const states = await QLGraph.find({}).toArray()

	t.is(result.rooms.length, 3)
	t.is(result.actions.length, 26)
	t.is(states.length, 1)
})

test('getCurrentState - should return the matching state', async t => {
	const status = getStatus()

	await createState(status)
	await createState(getStatus())

  const result = await getCurrentState(status)

	const states = await QLGraph.find({}).toArray()

	t.is(result.rooms.length, 3)
	t.is(result.actions.length, 26)
	t.is(states.length, 2)
})


test('calculateReward - should return 0 if no routines', async t => {
  const result = await calculateReward()

  t.deepEqual(result, [])
})