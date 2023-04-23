const { create, update, remove, get } = require('../db/routines')
const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/routines`

module.exports = {
  create: async (data, client) => {
    const routine = await create(data)
    if (routine?.insertedId) {
      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  update: async (data, client) => {
    const routine = await update(data)
    if (routine?.insertedId) {
      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  remove: async (data, client) => {
    const routine = await remove(data)
    if (routine?.deletedCount) {
      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  }
}
