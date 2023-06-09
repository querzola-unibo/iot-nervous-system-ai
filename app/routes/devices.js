const { create, update, remove, get } = require('../db/devices')
const AunothorizedDevice = require('../utils/aunothorized-devices') 

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  connect: async (data, client) => {
    const { deviceId, ...deviceProps } = data

    const [device] = await get({ deviceId })

    if(device){
      await update({_id: device._id, connected: true, ...deviceProps })
      
      const devices = await get({ connected: true })
      client.publish(topic, JSON.stringify(devices), { retain: true })
    } else {
      await AunothorizedDevice.add(data)
    }
  },
  create: async (data, client) => {
    const { deviceId } = data

    const deviceProps = AunothorizedDevice.get(deviceId)
    if (deviceProps) {
      await create({ ...data, ...deviceProps })
      AunothorizedDevice.remove(data.deviceId)

      const devices = await get({ connected: true })
      client.publish(topic, JSON.stringify(devices), { retain: true })
    }
  },
  update: async (data, client) => {
    await update(data)

    const devices = await get({ connected: true })
    client.publish(topic, JSON.stringify(devices), { retain: true })
  },
  updateParams: async (data, client) => {
    const { deviceId, params } = data

    const [device] = await get({ deviceId })

    if(device) {
      await update({ _id: device._id, params })

      const devices = await get({ connected: true })
      client.publish(topic, JSON.stringify(devices), { retain: true })
    }
  },
  remove: async (data, client) => {
    await remove(data)
    
    const devices = await get({ connected: true })
    client.publish(`${MQTT_ROOT_TOPIC}/devices`, JSON.stringify(devices), { retain: true })
  }
}