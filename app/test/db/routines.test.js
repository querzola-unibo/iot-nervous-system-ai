const test = require('ava')
const { collection, Id } = require('../../db')

const Routines = collection('routines')

const { create, update, remove, get } = require('../../db/routines')

test.beforeEach(async () => {
  await Routines.deleteMany({})
})

test('get - should return empty array if no routines', async t => {
  const result = await get()

  t.deepEqual(result, [])
})

test('get - should return all routines ', async t => {
  const roomId = new Id()

  await create({
    name: 'routine1',
    description: 'description1',
    roomId: roomId.toString()
  })

  await create({
    name: 'routine2',
    description: 'description2'
  })

  const result = await get()

  t.is(result.length, 2)

  const { _id, ...routine1 } = result[0]
  t.deepEqual(routine1, {
    name: 'routine1',
    description: 'description1',
    roomId: roomId.toString()
  })

  const { _id: _id2, ...routine2 } = result[1]
  t.deepEqual(routine2, {
    name: 'routine2',
    description: 'description2',
    roomId: null
  })
})

test('get - should return a list of routines filtered by query', async t => {
  const roomId = new Id()

  await create({
    name: 'routine1',
    description: 'description1',
    roomId: roomId.toString()
  })

  const routine2 = await create({
    name: 'routine2',
    description: 'description2'
  })

  const [result] = await get({ query: '2' })

  t.deepEqual(result, {
    _id: routine2.insertedId,
    name: 'routine2',
    description: 'description2',
    roomId: null
  })
})

test('create - creates a new routine', async t => {
  const roomId = new Id()

  const newRoutine = {
    name: 'New routine',
    description: 'description',
    roomId: roomId.toString()
  }

  const result = await create(newRoutine)

  const { _id, ...createdRoutine } = await Routines.findOne({
    _id: result.insertedId
  })

  t.deepEqual(createdRoutine, newRoutine)
})

test('update - update routine props', async t => {
  const roomId = new Id()

  const newRoutine = {
    name: 'New routine',
    description: 'description',
    roomId: roomId.toString()
  }

  const { insertedId } = await create(newRoutine)

  await update({
    _id: insertedId,
    name: 'Modified name',
    roomId: null
  })

  const updatedRoutine = await Routines.findOne({
    _id: insertedId
  })

  t.deepEqual(updatedRoutine, {
    _id: insertedId,
    name: 'Modified name',
    description: 'description',
    roomId: null
  })
})

test.only('remove - should remove routine by id', async t => {
  const deviceId = new Id()

  const newRoutine = {
    name: 'New routine',
    deviceIds: [deviceId.toString()]
  }

  const { insertedId } = await create(newRoutine)

  const r = await remove({ _id: insertedId })
console.log(r)
  const result = await Routines.findOne({
    _id: insertedId
  })

  t.deepEqual(result, null)
})
