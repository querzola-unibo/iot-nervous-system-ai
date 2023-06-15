const { collection, Id } = require('.')
const { normalizeId } = require('./utils/ids')
const Rooms = require('./rooms')


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
  electricity: 'ELECTRICITY',
  internet: 'INTERNET',
  light: 'LIGHT',
  airPollution: 'AIR POLLUTION',
  weather: 'WEATHER'
}

const create = async ({ name, type, element, deviceId, actuators = [], sensors = [], params = {} }) => {
  if (!name) {
    throw new Error('Device must have a name')
  }

  if(!deviceId) {
    throw new Error('Device must have a deviceId')
  }

  if (!type) {
    throw new Error('Device must have a type')
  }

  if (!Object.keys(DEVICE_TYPES).includes(type)) {
    throw new Error('Device type is invalid')
  }

  if (!Object.keys(ELEMENTS).includes(element)) {
    throw new Error('Device element is invalid')
  }

  return Devices.insertOne({ name, type, element, deviceId, connected: true, actuators, sensors, params  })
}

const update = async ({ _id, name, roomId, type, element, deviceId, connected, actuators = [], sensors = [], params = {} }) => {
  if (!_id) {
    throw new Error('Device id is not provided')
  }

  const fieldsToUpdate = {}

  if (name) {
    fieldsToUpdate.name = name
  }

  if (deviceId) {
    fieldsToUpdate.deviceId = deviceId
  }

  if (type) {
    if (!Object.keys(DEVICE_TYPES).includes(type)) {
      throw new Error('Device type is invalid')
    }

    fieldsToUpdate.type = type
  }

  if (element) {
    if (!Object.keys(ELEMENTS).includes(element)) {
      throw new Error('Device element is invalid')
    }

    fieldsToUpdate.element = element
  }

  if (roomId) {
    if (!getRoom(roomId)) {
      throw new Error('Device room not exists')
    }

    fieldsToUpdate.roomId = roomId
  }

  if (typeof connected === 'boolean') {
    fieldsToUpdate.connected = connected
  }

  if (actuators.length) {
    fieldsToUpdate.actuators = actuators
  }

  if (sensors.length) {
    fieldsToUpdate.sensors = sensors
  }

  const paramKeys = Object.keys(params)
  if (paramKeys.length) {
    paramKeys.forEach(k => {
      fieldsToUpdate[`params.${k}`] = params[k]
    })

    
  }

  const query = { _id: normalizeId(_id) }

  return Devices.findOneAndUpdate(
    query,
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  const query = { _id: normalizeId(_id) }

  return Devices.deleteOne(query)
}

const get = async ({ _id, query, type, deviceId, connected } = {}) => {
  const queryOnDevices = {}
  if (_id) {
    queryOnDevices._id = new Id(_id)
  }

  if (deviceId) {
    queryOnDevices.deviceId = deviceId
  }

  if (query) {
    queryOnDevices.name = {
      $regex: new RegExp(`${query.trim()}`, 'i')
    }
  }

  if (type) {
    queryOnDevices.type = type
  }

  if(typeof connected === 'boolean' ){
    queryOnDevices.connected = connected
  }

  return Devices.find(queryOnDevices).toArray()
}

const disconnectAll = async () => {
  const fieldsToUpdate = { connected: false }

  return Devices.updateMany(
    {},
    { $set: fieldsToUpdate }
  )
}

module.exports = {
  DEVICE_TYPES,
  ELEMENTS,
  create,
  update,
  remove,
  get,
  disconnectAll
}
