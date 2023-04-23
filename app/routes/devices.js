const { create, update, remove, get } = require('../db/devices')
const { createDevice, updateDevice, deleteDevice } = require('../states')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/devices`

module.exports = {
  create: async (data, client) => {
    const routine = await create(data)
    if (routine?.insertedId) {
      createDevice({ _id: routine.insertedId.toString(), ...data })
      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  update: async (data, client) => {
    const routine = await update(data)
    if (routine?.insertedId) {
      updateDevice({ _id: routine.insertedId.toString(), ...data })

      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  remove: async (data, client) => {
    const routine = await remove(data)
    if (routine?.deletedCount) {
      deleteDevice(data._id)

      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  }
}