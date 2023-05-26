const rooms = require('../db/rooms')
const { getInitialStatus }  = require('./utils')

const ROOMS = {}

const initRooms = async () => await getInitialStatus(rooms, ROOMS)


const getRooms = ({ ids = [], query, type, floor } = {}) => {
  return Object.keys(ROOMS)
    .filter(r => {
      if (ids.length && !ids.includes(r)) {
        return false
      }

      const room = ROOMS[r]

      if (query && !room.name.match(new RegExp(query, 'i'))) {
        return false
      }

      if (type && room.type !== type) {
        return false
      }

      if (typeof floor === 'number' && room.floor !== floor) {
        return false
      }

      return true
    })
    .map(r => ({ id: r, ...ROOMS[r] }))
}

const getRoom = id => ROOMS[id]

const createRoom = ({ id, name, type, floor = 0, deviceIds = [] }) => {
  if (!id) {
    throw new Error('Room must have an id')
  }

  if (ROOMS[id]) {
    throw new Error('Room id already in use')
  }

  if (!name) {
    throw new Error('Room must have a name')
  }

  if (!type) {
    throw new Error('Room must have a type')
  }

  if (!Object.keys(rooms.ROOM_TYPES).includes(type)) {
    throw new Error('Room type is invalid')
  }

  ROOMS[id] = { name, type, floor, deviceIds }
}

const updateRoom = ({
  id,
  name,
  type,
  floor,
  stats = {},
  deviceIds = []
} = {}) => {
  if (!id) {
    throw new Error('Room id is not provided')
  }

  const updatedRoom = ROOMS[id]

  if (!updatedRoom) {
    throw new Error('unexisting room')
  }

  if (name) {
    updatedRoom.name = name
  }

  if (type) {
    if (!Object.values(rooms.ROOM_TYPES).includes(type)) {
      throw new Error('Room type is invalid')
    }

    updatedRoom.type = type
  }

  if (floor) {
    updatedRoom.floor = floor
  }

  if (Object.keys(stats)) {
    updatedRoom.stats = {
      ...updatedRoom.stats,
      ...stats
    }
  }

  if (deviceIds.length) {
    updatedRoom.deviceIds = deviceIds
  }

  ROOMS[id] = updatedRoom
}

const deleteRoom = id => delete ROOMS[id]

module.exports = {
  initRooms,
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
}
