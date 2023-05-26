const test = require('ava')
const { collection, Id } = require('../../db')

const QLGraph = collection('ql-graph')

const {
  getMatchingStates, 
	createState,
	getState
} = require('../../db/ql-graph')

const { getStatus } = require('../utils/status')

test.beforeEach(async () => {
  await QLGraph.deleteMany({})
})


test('getState - should return empty array if no devices', async t => {
	const id = '6464adf3182dfcad74e72ff9'
  const result = await getState(id)

  t.deepEqual(result, [])
})

test('getState - should return device by id ', async t => {
  const createdState = await createState(getStatus())

  const [result] = await getState(createdState.insertedId)

  const state = await QLGraph.findOne({_id: createdState.insertedId})

  t.deepEqual(result, state)
})

test('getMatchingStates - should return no states if any match', async t => {
  const result = await getMatchingStates(getStatus())

  t.deepEqual(result, [])
})

test('getMatchingStates - should return matching states', async t => {
	const matchingStatus = getStatus()

	const createdState = await createState(matchingStatus)
	await createState(getStatus())

  const [result] = await getMatchingStates(matchingStatus)

	const state = await QLGraph.findOne({_id: createdState.insertedId})

  t.deepEqual(result, state)
})

test('createState - creates a new state', async t => {
	const status = getStatus()
  const result = await createState(status)

  const { _id, actions, rooms } = await QLGraph.findOne({
    _id: result.insertedId
  })

	t.is(actions.length, 26)
	t.is(rooms.length, 3)
})

test.skip('update - update device props', async t => {
  const roomId = new Id()

  const newDevice = {
    name: 'New device',
    roomIds: [roomId.toString()],
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.water
  }

  const { insertedId } = await create(newDevice)

  await update({
    _id: insertedId,
    name: 'Modified name',
    type: DEVICE_TYPES.actuator,
    element: ELEMENTS.energy
  })

  const updatedDevice = await QLGraph.findOne({
    _id: insertedId
  })

  t.deepEqual(updatedDevice, {
    _id: insertedId,
    element: 'ENERGY',
    name: 'Modified name',
    roomIds: [roomId.toString()],
    type: 'ACTUATOR'
  })
})

test.skip('remove - should remove device by id', async t => {
  const roomId = new Id()

  const newDevice = {
    name: 'New device',
    roomIds: [roomId.toString()],
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.water
  }

  const { insertedId } = await create(newDevice)

  await remove({ _id: insertedId })

  const result = await QLGraph.findOne({
    _id: insertedId
  })

  t.deepEqual(result, null)
})
