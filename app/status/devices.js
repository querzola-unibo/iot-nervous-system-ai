const { DEVICE_TYPES, ELEMENTS } = require('../db/devices')
const { getRoom } = require('./rooms')

const DEVICES = {}
const UNAUTHORIZED_DEVICES = {}

const getDevices = ({ ids = [], query, roomIds = [], type, element } = {}) => {
  return Object.keys(DEVICES)
    .filter(d => {
      if (ids.length && !ids.includes(d)) {
        return false
      }

      const device = DEVICES[d]

      if (roomIds.length && !roomIds.includes(device.roomId)) {
        return false
      }

      if (query && !device.name.match(new RegExp(query, 'i'))) {
        return false
      }

      if (type && device.type !== type) {
        return false
      }
      if (element && device.element !== element) {
        return false
      }

      return true
    })
    .map(d => ({ id: d, ...DEVICES[d] }))
}

const getDevice = id => DEVICES[id]

const getDeviceByDeviceId = deviceId => {
  const id = Object.keys(DEVICES).find(d => DEVICES[d].deviceId === deviceId)

  if(id) {
    return { id, ...DEVICES[id] }
  }

  return null
}


const createDevice = ({ id, name, roomId, type, element, deviceId, actuators = [], sensors = [], params = {} }) => {
  if (!id) {
    throw new Error('Device must have an id')
  }

  if (DEVICES[id]) {
    throw new Error('Device id already in use')
  }

  if(!deviceId) {
    throw new Error('Device must have a deviceId')
  }

  if (!name) {
    throw new Error('Device must have a name')
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

  if (roomId && !getRoom(roomId)) {
    throw new Error('Device room not exists')
  }

  DEVICES[id] = { name, type, roomId, element, deviceId, actuators, sensors, params }
}

const updateDevice = ({
  id,
  name,
  roomId,
  type,
  element,
  deviceId,
  params = {},
  stats = {}
} = {}) => {
  if (!id) {
    throw new Error('Device id is not provided')
  }

  const updatedDevice = DEVICES[id]

  if (!updatedDevice) {
    throw new Error('unexisting device')
  }

  if (name) {
    updatedDevice.name = name
  }

  if (deviceId) {
    updatedDevice.deviceId = deviceId
  }

  if (type) {
    if (!Object.keys(DEVICE_TYPES).includes(type)) {
      throw new Error('Device type is invalid')
    }

    updatedDevice.type = type
  }

  if (element) {
    if (!Object.keys(ELEMENTS).includes(element)) {
      throw new Error('Device element is invalid')
    }

    updatedDevice.element = element
  }

  if (roomId) {
    if (!getRoom(roomId)) {
      throw new Error('Device room not exists')
    }

    updatedDevice.roomId = roomId
  }

  if (Object.keys(params)) {
    updatedDevice.params = {
      ...updatedDevice.params,
      ...params
    }
  }

  if (Object.keys(stats)) {
    updatedDevice.stats = {
      ...updatedDevice.stats,
      ...stats
    }
  }

  DEVICES[id] = updatedDevice
}

const deleteDevice = id => delete DEVICES[id]

const getAunothorizedDeviceIds = () => Object.keys(UNAUTHORIZED_DEVICES)

const getAunothorizedDevice = (id) => UNAUTHORIZED_DEVICES[id]

const addAunothorizedDevice = (device) => {
  const {id, ...props} = device
  if(!UNAUTHORIZED_DEVICES[id]) { 
    UNAUTHORIZED_DEVICES[id] = props
  }
}

const deleteAunothorizedDevice = (id) => delete UNAUTHORIZED_DEVICES[id]


module.exports = {
  getDevices,
  getDevice,
  getDeviceByDeviceId,
  createDevice,
  updateDevice,
  deleteDevice,
  getAunothorizedDeviceIds,
  getAunothorizedDevice,
  addAunothorizedDevice,
  deleteAunothorizedDevice
}
