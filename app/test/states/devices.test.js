const test = require('ava')
const { DEVICE_TYPES, ELEMENTS } = require('../../db/devices')
const { ROOM_TYPES } = require('../../db/rooms')

const {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice
} = require('../../states/devices')
const { createRoom, getRooms, deleteRoom } = require('../../states/rooms')

test.afterEach(() => {
  getDevices().forEach(r => deleteDevice(r.id))
  getRooms().forEach(r => deleteRoom(r.id))
})

test('getDevice - should return undefined if no devices', t => {
  const result = getDevice('1')

  t.deepEqual(result, undefined)
})

test('getDevice - should return the room by id', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevice('2')

  t.deepEqual(result, {
    element: 'AIR POLLUTION',
    name: 'Baudo',
    roomId: undefined,
    type: 'SENSOR'
  })
})

test('getDevices - should return empty array if no devices', t => {
  const result = getDevices()

  t.deepEqual(result, [])
})

test('getDevices - should return a list of devices filtered by ids', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevices({ ids: ['2'] })

  t.deepEqual(result, [
    {
      id: '2',
      element: 'AIR POLLUTION',
      name: 'Baudo',
      roomId: undefined,
      type: 'SENSOR'
    }
  ])
})

test('getDevices - should return a list of devices filtered by query', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevices({ query: 'pi' })

  t.deepEqual(result, [
    {
      element: 'LIGHT',
      id: '1',
      name: 'Pippo',
      roomId: undefined,
      type: 'HYBRID'
    }
  ])
})

test('getDevices - should return a list of devices filtered by roomIds', t => {
  createRoom({
    id: '3',
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom
  })
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light,
    roomId: '3'
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevices({ roomIds: ['3', '2'] })

  t.deepEqual(result, [
    {
      element: 'LIGHT',
      id: '1',
      name: 'Pippo',
      roomId: '3',
      type: 'HYBRID'
    }
  ])
})

test('getDevices - should return a list of devices filtered by type', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevices({ type: DEVICE_TYPES.sensor })

  t.deepEqual(result, [
    {
      element: 'AIR POLLUTION',
      id: '2',
      name: 'Baudo',
      roomId: undefined,
      type: 'SENSOR'
    }
  ])
})

test('getDevices - should return a list of devices filtered by element', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.light
  })
  createDevice({
    id: '2',
    name: 'Baudo',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.airPollution
  })

  const result = getDevices({ element: ELEMENTS.light })

  t.deepEqual(result, [
    {
      element: 'LIGHT',
      id: '1',
      name: 'Pippo',
      roomId: undefined,
      type: 'HYBRID'
    }
  ])
})

test('createDevice - throws error if missing id', t => {
  t.throws(() => createDevice({}))
})

test('createDevice - throws error if id already exists', t => {
  createDevice({
    id: '1',
    name: 'Pippo',
    type: DEVICE_TYPES.actuator,
    element: ELEMENTS.airPollution
  })

  t.throws(() => createDevice({ id: '1' }))
})

test('createDevice - throws error if missing name', t => {
  t.throws(() => createDevice({ id: '1' }))
})

test('createDevice - throws error if missing device type', t => {
  t.throws(() => createDevice({ id: '1', name: 'Manu device' }))
})

test('createDevice - throws error if wrong room type', t => {
  t.throws(() =>
    createDevice({ id: '1', name: 'Manu device', type: 'wrong type' })
  )
})

test('createDevice - throws error if missing device element', t => {
  t.throws(() =>
    createDevice({ id: '1', name: 'Manu device', type: DEVICE_TYPES.actuator })
  )
})

test('createDevice - throws error if wrong device element', t => {
  t.throws(() =>
    createDevice({
      id: '1',
      name: 'Manu device',
      type: DEVICE_TYPES.actuator,
      element: 'fire'
    })
  )
})

test('createDevice - throws error if unexistring roomId', t => {
  t.throws(() =>
    createDevice({
      id: '1',
      name: 'Device',
      type: DEVICE_TYPES.actuator,
      element: ELEMENTS.energy,
      roomId: '3'
    })
  )
})

test('createDevice - successfully creates a device', t => {
  const id = '1'

  createDevice({
    id: '1',
    name: 'Manu device',
    type: DEVICE_TYPES.actuator,
    element: ELEMENTS.energy
  })

  t.deepEqual(getDevice(id), {
    element: 'ENERGY',
    name: 'Manu device',
    roomId: undefined,
    type: 'ACTUATOR'
  })
})

test('updateDevice - throws error if missing id', t => {
  t.throws(() => updateDevice())
})

test('updateDevice - throws error if device not exists', t => {
  const id = '1'

  createDevice({
    id,
    name: 'Manu device',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.airPollution
  })

  t.throws(() => updateDevice({ id: '2' }))
})

test('updateDevice - throws error if wrong device type', t => {
  const id = '1'

  createDevice({
    id,
    name: 'Manu device',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.airPollution
  })

  t.throws(() => updateDevice({ id: '1', type: 'wrong type' }))
})

test('updateDevice - throws error if wrong device element', t => {
  const id = '1'

  createDevice({
    id,
    name: 'Manu device',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.airPollution
  })

  t.throws(() => updateDevice({ id: '1', element: 'wrong element' }))
})

test('updateDevice - throws error if wrong room id', t => {
  const id = '1'

  createDevice({
    id,
    name: 'Manu device',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.airPollution
  })

  t.throws(() => updateDevice({ id: '1', roomId: '2' }))
})

test('updateDevice - updates only given params', t => {
  const id = '1'

  createDevice({
    id,
    name: 'Manu device',
    type: DEVICE_TYPES.hybrid,
    element: ELEMENTS.airPollution
  })
  createRoom({
    id,
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom
  })

  updateDevice({ id, params: { temperature: 18.5 } })

  t.deepEqual(getDevice(id), {
    element: 'AIR POLLUTION',
    name: 'Manu device',
    params: {
      temperature: 18.5
    },
    roomId: undefined,
    stats: {},
    type: 'HYBRID'
  })

  updateDevice({
    id,
    name: 'New name',
    type: DEVICE_TYPES.sensor,
    element: ELEMENTS.water,
    params: { light: 1444 },
    roomId: '1'
  })

  t.deepEqual(getDevice(id), {
    element: 'WATER',
    name: 'New name',
    params: {
      light: 1444,
      temperature: 18.5
    },
    roomId: '1',
    stats: {},
    type: 'SENSOR'
  })
})

test('deleteDevice - should delete device by id', t => {
  const id = '1'
  createDevice({
    id: '1',
    name: 'Manu device',
    type: DEVICE_TYPES.actuator,
    element: ELEMENTS.energy
  })

  t.is(getDevices().length, 1)

  deleteDevice(id)

  t.is(getDevices().length, 0)
})
