const { create, update, remove, get } = require('../db/devices')
const { createDevice, updateDevice, deleteDevice, getDevice, addAunothorizedDevice, deleteAunothorizedDevice } = require('../status')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data) => {
    const [device] = await get({deviceId: data.id})
    if(device){
      const {_id, ...props} = device
      createDevice({id: _id.toString(), ...props})
    } else {
      await addAunothorizedDevice(data.id)
    }
  },
  create: async (data) => {
    const device = await create(data)
    deleteAunothorizedDevice(data.deviceId)

    if (device?.insertedId) {
      createDevice({ id: device.insertedId.toString(), ...data }) 
    }
  },
  update: async (data) => {
    const device = await update(data)
    console.log(data)
    if (device?.insertedId) {
      updateDevice({ id: device.insertedId.toString(), ...data })
    }
  },
  remove: async (data) => {
    const device = await remove(data)
    if (device?.deletedCount) {
      deleteDevice(data._id)
    }
  }
}