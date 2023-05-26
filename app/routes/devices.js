const { create, update, remove, get } = require('../db/devices')
const { createDevice, updateDevice, deleteDevice, getDeviceByDeviceId, addAunothorizedDevice, deleteAunothorizedDevice, getAunothorizedDevice } = require('../status')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data) => {
    const {id, ...deviceProps} = data

    const [device] = await get({deviceId: id})
    if(device){
      const {_id, ...props} = device
      createDevice({id: _id.toString(), ...props, ...deviceProps})
    } else {
      await addAunothorizedDevice(data)
    }
  },
  create: async (data) => {
    const { deviceId } = data

    const deviceProps = getAunothorizedDevice(deviceId)
    if (deviceProps) {
      const newDevice = await create(data)
      deleteAunothorizedDevice(data.deviceId)

      if (newDevice?.insertedId) {
        createDevice({ id: newDevice.insertedId.toString(), ...data, ...deviceProps }) 
      }
    }
  },
  update: async (data) => {
      const device = await update(data)
      if (device?.insertedId) {
        updateDevice({ id: device.insertedId.toString(), ...data })
      }
  },
  updateParams: (data) => {
    const {deviceId, params} = data
    const device = getDeviceByDeviceId(deviceId)

    if(device) {
      updateDevice({ id: device.id, params })
    }
  },
  remove: async (data) => {
    const device = await remove(data)
    if (device?.deletedCount) {
      deleteDevice(data._id)
    }
  }
}