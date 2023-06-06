const { create, update, remove, get } = require('../db/devices')
const AunothorizedDevice = require('../utils/aunothorized-devices') 

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data) => {
    const { deviceId, ...deviceProps } = data

    const [device] = await get({ deviceId })

    if(device){
      update({_id: device._id, connected: true, ...deviceProps })
    } else {
      await AunothorizedDevice.add(data)
    }
  },
  create: async (data) => {
    const { deviceId } = data

    const deviceProps = AunothorizedDevice.get(deviceId)
    if (deviceProps) {
      await create({ ...data, ...deviceProps })
      AunothorizedDevice.remove(data.deviceId)
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