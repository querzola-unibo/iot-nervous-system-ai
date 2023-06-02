const { create, update, remove, get } = require('../db/devices')
const { addAunothorizedDevice, deleteAunothorizedDevice, getAunothorizedDevice } = require('../status') 

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data) => {
    const { deviceId, ...deviceProps } = data
    console.log(data)
    const [device] = await get({ deviceId })

    if(device){
      update({_id: device._id, connected: true, ...deviceProps })
    } else {
      await addAunothorizedDevice(data)
    }
  },
  create: async (data) => {
    const { deviceId } = data

    const deviceProps = getAunothorizedDevice(deviceId)
    if (deviceProps) {
      const newDevice = await create({ ...data, ...deviceProps })
      deleteAunothorizedDevice(data.deviceId)
    }
  },
  update: async (data) => {
    await update(data)
  },
  updateParams: async (data) => {
    const { deviceId, params } = data

    const [device] = await get({ deviceId })

    if(device) {
      update({ _id: device._id, params })
    }
  },
  remove: async (data) => {
    const device = await remove(data)
    if (device?.deletedCount) {
      deleteDevice(data._id)
    }
  }
}