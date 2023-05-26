const { collection, Id } = require('.')

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

const create = async ({ name, type, deviceIds = [] }) => {
  return Rooms.insertOne({ name, type, deviceIds })
}

const update = async ({ _id, ...fieldsToUpdate }) => {
  return Rooms.findOneAndUpdate(
    { _id: new Id(_id) },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  return Rooms.deleteOne({ _id })
}

const get = async ({ query, type } = {}) => {
  const queryOnRooms = {}

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
