const { collection, Id } = require('.')
const { normalizeId } = require('./utils/ids')
const Rooms = collection('rooms')

const ROOM_TYPES = {
  bedroom: 'BEDROOM',
  'living-room': 'LIVING ROOM',
  kitchen: 'KITCHEN',
  office: 'OFFICE',
  hallway: 'HALLWAY',
  garage: 'GARAGE',
  cellar: 'CELLAR',
  attic: 'ATTIC',
  'dining-room': 'DINING ROOM',
  bathroom: 'BATHROOM',
  balcony: 'BALCONY',
  entryway: 'ENTRYWAY'
}

const create = async ({ name, type, deviceIds = [], floor = 0, }) => {
  if (!name) {
    throw new Error('Room must have a name')
  }

  if (!type) {
    throw new Error('Room must have a type')
  }

  if (!Object.keys(ROOM_TYPES).includes(type)) {
    throw new Error('Room type is invalid')
  }

  return Rooms.insertOne({ name, type, deviceIds, floor })
}

const update = async ({ _id, name, type, floor, deviceIds = [] }) => {
  if (!_id) {
    throw new Error('Device id is not provided')
  }

  const fieldsToUpdate = {}

  if (name) {
    fieldsToUpdate.name = name
  }

  if (type) {
    if (!Object.values(rooms.ROOM_TYPES).includes(type)) {
      throw new Error('Room type is invalid')
    }

    fieldsToUpdate.type = type
  }

  if (floor) {
    fieldsToUpdate.floor = floor
  }

  if (deviceIds.length) {
    fieldsToUpdate.deviceIds = deviceIds
  }

  const query = { _id: normalizeId(_id) }

  return Rooms.findOneAndUpdate(
    query,
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  return Rooms.deleteOne({ _id })
}

const get = async ({ _id, query, type } = {}) => {
  const queryOnRooms = {}

  if(_id) {
    queryOnRooms._id = normalizeId(_id)
  }

  if (query) {
    queryOnRooms.name = {
      $regex: new RegExp(`${query.trim()}`, 'i')
    }
  }

  if (type) {
    queryOnRooms.type = type
  }

  return Rooms.find(queryOnRooms).toArray()
}

module.exports = {
  ROOM_TYPES,
  get,
  create,
  update,
  remove
}
