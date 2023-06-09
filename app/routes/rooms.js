const { create, update, remove, get } = require('../db/rooms')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/rooms`

module.exports = {
  create: async (data, client) => {
    await create(data)

    const rooms = await get()
    client.publish(topic, JSON.stringify(rooms), { retain: true })
  },
  update: async (data, client) => {
    await update(data)

    const rooms = await get()
    client.publish(topic, JSON.stringify(rooms), { retain: true })
  },
  remove: async (data, client) => {
    await remove(data)

    const rooms = await get()
    client.publish(topic, JSON.stringify(rooms), { retain: true })
  }  
}
