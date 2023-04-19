const test = require('ava')
const { collection, Id } = require('../../db')

const Devices = collection('devices')

const {
  DEVICE_TYPES,
  ELEMENTS,
  create,
  update,
  remove,
  get
} = require('../../db/devices')

test.beforeEach(async () => {
  await Devices.deleteMany({})
})

test('get - should return empty array if no devices', async t => {
  const result = await get()

  t.deepEqual(result, [])
})

test('get - should return all devices ', async t => {
  await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator
  })

  await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor
  })

  const result = await get()

  t.is(result.length, 2)

  const { _id, ...device1 } = result[0]
  t.deepEqual(device1, {
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    element: null,
    roomIds: []
  })

  const { _id: _id2, ...device2 } = result[1]
  t.deepEqual(device2, {
    name: 'device2',
    element: null,
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })
})

test('get - should return devices by id', async t => {
  const roomId = new Id()
  const device1 = await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })

  await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })

  const [result] = await get({ _id: device1.insertedId })

  t.deepEqual(result, {
    _id: device1.insertedId,
    name: 'device1',
    element: null,
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })
})

test('get - should return a list of devices filtered by query', async t => {
  const roomId = new Id()
  await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })

  const device2 = await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })

  const [result] = await get({ query: '2' })

  t.deepEqual(result, {
    _id: device2.insertedId,
    name: 'device2',
    element: null,
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })
})

test('get - should return a list of devices filtered by roomIds', async t => {
  const roomId = new Id()
  const device1 = await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })

  await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })

  const [result] = await get({ roomIds: [roomId.toString()] })

  t.deepEqual(result, {
    _id: device1.insertedId,
    name: 'device1',
    element: null,
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })
})

test('get - should return a list of devices filtered by type', async t => {
  const roomId = new Id()
  await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })

  const device2 = await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })

  const [result] = await get({ type: DEVICE_TYPES.sensor })

  t.deepEqual(result, {
    _id: device2.insertedId,
    name: 'device2',
    element: null,
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })
})

test.skip('get - should return a list of devices filtered by element', async t => {
  const roomId = new Id()
  await create({
    name: 'device1',
    type: DEVICE_TYPES.actuator,
    roomIds: [roomId.toString()]
  })

  const device2 = await create({
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })

  const [result] = await get({ element: DEVICE_TYPES.sensor })

  t.deepEqual(result, {
    _id: device2.insertedId,
    name: 'device2',
    type: DEVICE_TYPES.sensor,
    roomIds: []
  })
})

test('create - creates a new device', async t => {
  const roomId = new Id()

  const newDevice = {
    name: 'New device',
    roomIds: [roomId.toString()],
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.water
  }

  const result = await create(newDevice)

  const { _id, ...createdDevice } = await Devices.findOne({
    _id: result.insertedId
  })

  t.deepEqual(createdDevice, newDevice)
})

test('update - update device props', async t => {
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

  const updatedDevice = await Devices.findOne({
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

test('remove - should remove device by id', async t => {
  const roomId = new Id()

  const newDevice = {
    name: 'New device',
    roomIds: [roomId.toString()],
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.water
  }

  const { insertedId } = await create(newDevice)

  await remove({ _id: insertedId })

  const result = await Devices.findOne({
    _id: insertedId
  })

  t.deepEqual(result, null)
})
