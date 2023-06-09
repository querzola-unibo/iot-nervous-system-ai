const { create, update, remove, get } = require('../db/routines')
const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/routines`

module.exports = {
  create: async (data, client) => {
    await create(data)

    const routines = await get()
    client.publish(topic, JSON.stringify(routines), { retain: true })
  },
  update: async (data, client) => {
    await update(data) 

    const routines = await get()
    client.publish(topic, JSON.stringify(routines), { retain: true })
  },
  remove: async (data, client) => {
    await remove(data)

    const routines = await get()
    client.publish(topic, JSON.stringify(routines), { retain: true })
  }
}
