const test = require('ava')
const { collection, Id } = require('../../db')

const Rooms = collection('rooms')

const { ROOM_TYPES, create, update, remove, get } = require('../../db/rooms')

test.beforeEach(async () => {
  await Rooms.deleteMany({})
})

test('get - should return empty array if no rooms', async t => {
  const result = await get()

  t.deepEqual(result, [])
})

test('get - should return all rooms ', async t => {
  await create({
    name: 'room1',
    type: ROOM_TYPES.bedroom
  })

  await create({
    name: 'room2',
    type: ROOM_TYPES.kitchen
  })

  const result = await get()

  t.is(result.length, 2)

  const { _id, ...room1 } = result[0]
  t.deepEqual(room1, {
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: []
  })

  const { _id: _id2, ...room2 } = result[1]
  t.deepEqual(room2, {
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })
})

test('get - should return rooms by id', async t => {
  const deviceId = new Id()
  const room1 = await create({
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })

  await create({
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })

  const [result] = await get({ _id: room1.insertedId })

  t.deepEqual(result, {
    _id: room1.insertedId,
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })
})

test('get - should return a list of rooms filtered by query', async t => {
  const deviceId = new Id()
  await create({
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })

  const room2 = await create({
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })

  const [result] = await get({ query: '2' })

  t.deepEqual(result, {
    _id: room2.insertedId,
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })
})

test('get - should return a list of rooms filtered by deviceIds', async t => {
  const deviceId = new Id()
  const room1 = await create({
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })

  await create({
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })

  const [result] = await get({ deviceIds: [deviceId.toString()] })

  t.deepEqual(result, {
    _id: room1.insertedId,
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })
})

test('get - should return a list of rooms filtered by type', async t => {
  const deviceId = new Id()
  await create({
    name: 'room1',
    type: ROOM_TYPES.bedroom,
    deviceIds: [deviceId.toString()]
  })

  const room2 = await create({
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })

  const [result] = await get({ type: ROOM_TYPES.kitchen })

  t.deepEqual(result, {
    _id: room2.insertedId,
    name: 'room2',
    type: ROOM_TYPES.kitchen,
    deviceIds: []
  })
})

test('create - creates a new room', async t => {
  const deviceId = new Id()

  const newDevice = {
    name: 'New room',
    deviceIds: [deviceId.toString()],
    type: ROOM_TYPES.attic
  }

  const result = await create(newDevice)

  const { _id, ...createdDevice } = await Rooms.findOne({
    _id: result.insertedId
  })

  t.deepEqual(createdDevice, newDevice)
})

test('update - update room props', async t => {
  const deviceId = new Id()

  const newDevice = {
    name: 'New room',
    deviceIds: [deviceId.toString()],
    type: ROOM_TYPES.attic
  }

  const { insertedId } = await create(newDevice)

  await update({
    _id: insertedId,
    name: 'Modified name',
    type: ROOM_TYPES.attic
  })

  const updatedDevice = await Rooms.findOne({
    _id: insertedId
  })

  t.deepEqual(updatedDevice, {
    _id: insertedId,
    name: 'Modified name',
    deviceIds: [deviceId.toString()],
    type: 'ATTIC'
  })
})

test('remove - should remove room by id', async t => {
  const deviceId = new Id()

  const newDevice = {
    name: 'New room',
    deviceIds: [deviceId.toString()],
    type: ROOM_TYPES.attic
  }

  const { insertedId } = await create(newDevice)

  await remove({ _id: insertedId })

  const result = await Rooms.findOne({
    _id: insertedId
  })

  t.deepEqual(result, null)
})
