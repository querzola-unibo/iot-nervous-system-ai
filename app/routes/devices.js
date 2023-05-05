const { create, update, remove, get } = require('../db/devices')
const { createDevice, updateDevice, deleteDevice, getDevice, addAunothorizedDevice, deleteAunothorizedDevice } = require('../status')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data) => {
    if(!getDevice(data.id)){
      await addAunothorizedDevice(data.id)
    }
  },
  create: async (data) => {
    const device = await create(data)
    deleteAunothorizedDevice(data.deviceId)

    if (device?.insertedId) {
      createDevice({ _id: device.insertedId.toString(), ...data }) 
    }
  },
  update: async (data) => {
    const device = await update(data)
    if (device?.insertedId) {
      updateDevice({ _id: device.insertedId.toString(), ...data })
    }
  },
  remove: async (data, client) => {
    const device = await remove(data)
    if (device?.deletedCount) {
      deleteDevice(data._id)
    }
  }
}