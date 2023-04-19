const test = require('ava')
const { ROOM_TYPES } = require('../../db/rooms')

const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../../states/rooms')

test.afterEach(() => {
  getRooms().forEach(r => deleteRoom(r.id))
})

test('getRoom - should return undefined if no rooms', t => {
  const result = getRoom('1')

  t.deepEqual(result, undefined)
})

test('getRoom - should return the room by id', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom })
  createRoom({ id: '2', name: 'Baudo', type: ROOM_TYPES.kitchen })

  const result = getRoom('2')

  t.deepEqual(result, {
    devices: [],
    floor: 0,
    name: 'Baudo',
    type: 'KITCHEN'
  })
})

test('getRooms - should return empty array if no rooms', t => {
  const result = getRooms()

  t.deepEqual(result, [])
})

test('getRooms - should return a list of rooms filtered by ids', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom })
  createRoom({ id: '2', name: 'Baudo', type: ROOM_TYPES.kitchen })

  const result = getRooms({ ids: ['2'] })

  t.deepEqual(result, [
    {
      devices: [],
      floor: 0,
      id: '2',
      name: 'Baudo',
      type: 'KITCHEN'
    }
  ])
})

test('getRooms - should return a list of rooms filtered by query', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom })
  createRoom({ id: '2', name: 'Baudo', type: ROOM_TYPES.kitchen })

  const result = getRooms({ query: 'pi' })

  t.deepEqual(result, [
    {
      devices: [],
      floor: 0,
      id: '1',
      name: 'Pippo',
      type: 'BEDROOM'
    }
  ])
})

test('getRooms - should return a list of rooms filtered by type', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom })
  createRoom({ id: '2', name: 'Baudo', type: ROOM_TYPES.kitchen })

  const result = getRooms({ type: ROOM_TYPES.bedroom })

  t.deepEqual(result, [
    {
      devices: [],
      floor: 0,
      id: '1',
      name: 'Pippo',
      type: 'BEDROOM'
    }
  ])
})

test('getRooms - should return a list of rooms filtered by floor', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom, floor: 1 })
  createRoom({ id: '2', name: 'Baudo', type: ROOM_TYPES.kitchen, floor: 0 })

  const result = getRooms({ floor: 0 })

  t.deepEqual(result, [
    {
      devices: [],
      id: '2',
      name: 'Baudo',
      type: 'KITCHEN',
      floor: 0
    }
  ])
})

test('createRoom - throws error if missing id', t => {
  t.throws(() => createRoom({}))
})

test('createRoom - throws error if id already exists', t => {
  createRoom({ id: '1', name: 'Pippo', type: ROOM_TYPES.bedroom })

  t.throws(() => createRoom({ id: '1' }))
})

test('createRoom - throws error if missing name', t => {
  t.throws(() => createRoom({ id: '1' }))
})

test('createRoom - throws error if missing room type', t => {
  t.throws(() => createRoom({ id: '1', name: 'Manu bedroom' }))
})

test('createRoom - throws error if wrong room type', t => {
  t.throws(() =>
    createRoom({ id: '1', name: 'Manu bedroom', type: 'soppalco' })
  )
})

test('createRoom - successfully creates a room', t => {
  const id = '1'

  createRoom({
    id,
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom,
    floor: 0
  })

  t.deepEqual(getRoom(id), {
    devices: [],
    floor: 0,
    name: 'Manu bedroom',
    type: 'BEDROOM'
  })
})

test('updateRoom - throws error if missing id', t => {
  t.throws(() => updateRoom())
})

test('updateRoom - throws error if room not exists', t => {
  const id = '1'

  createRoom({
    id,
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom,
    floor: 0
  })

  t.throws(() => updateRoom({ id: '2' }))
})

test('updateRoom - throws error if wrong room type', t => {
  const id = '1'

  createRoom({
    id,
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom,
    floor: 0
  })

  t.throws(() => updateRoom({ id: '1', type: 'cantina' }))
})

test('updateRoom - updates only given params', t => {
  const id = '1'

  createRoom({
    id,
    name: 'Manu bedroom',
    type: ROOM_TYPES.bedroom,
    floor: 0
  })

  updateRoom({ id, params: { temperature: 18.5 }, devices: ['curtain'] })

  t.deepEqual(getRoom(id), {
    devices: ['curtain'],
    floor: 0,
    name: 'Manu bedroom',
    params: {
      temperature: 18.5
    },
    stats: {},
    type: 'BEDROOM'
  })

  updateRoom({
    id,
    name: 'New name',
    type: ROOM_TYPES.bathroom,
    floor: 2,
    params: { light: 1444 },
    devices: ['light', 'curtain']
  })

  t.deepEqual(getRoom(id), {
    devices: ['light', 'curtain'],
    floor: 2,
    name: 'New name',
    params: {
      temperature: 18.5,
      light: 1444
    },
    stats: {},
    type: 'BATHROOM'
  })
})

test('deleteRoom - should delete room by id', t => {
  const id = '1'
  createRoom({ id, name: 'Pippo', type: ROOM_TYPES.bedroom })

  t.is(getRooms().length, 1)

  deleteRoom(id)

  t.is(getRooms().length, 0)
})
