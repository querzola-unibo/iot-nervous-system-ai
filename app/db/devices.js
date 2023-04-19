const { collection, Id } = require('.')

const Devices = collection('devices')

const DEVICE_TYPES = {
  sensor: 'SENSOR',
  actuator: 'ACTUATOR',
  hybrid: 'HYBRID'
}

const ELEMENTS = {
  water: 'WATER',
  temperature: 'TEMPERATURE',
  sound: 'SOUND',
  energy: 'ENERGY',
  internet: 'INTERNET',
  light: 'LIGHT',
  airPollution: 'AIR POLLUTION',
  weather: 'WEATHER'
}

const create = async ({ name, type, roomIds = [], element }) => {
  return Devices.insertOne({ name, type, roomIds, element })
}

const update = async ({ _id, ...fieldsToUpdate }) => {
  return Devices.findOneAndUpdate(
    { _id },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  return Devices.deleteOne({ _id })
}

const get = async ({ _id, query, type, roomIds = [] } = {}) => {
  const queryOnDevices = {}
  if (_id) {
    queryOnDevices._id = new Id(_id)
  }

  if (query) {
    queryOnDevices.name = {
      $regex: new RegExp(`${query.trim()}`, 'i')
    }
  }

  if (type) {
    queryOnDevices.type = type
  }

  if (roomIds.length) {
    queryOnDevices.roomIds = { $in: roomIds }
  }
  return Devices.find(queryOnDevices).toArray()
}

module.exports = {
  DEVICE_TYPES,
  ELEMENTS,
  create,
  update,
  remove,
  get
}
