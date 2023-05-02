const { create, update, remove, get } = require('../db/rooms')
const { createRoom, updateRoom, deleteRoom } = require('../status')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/rooms`

module.exports = {
  create: async (data, client) => {
    const routine = await create(data)
    if (routine?.insertedId) {
      console.log(routine?.insertedId.toString())
      createRoom({ id: routine.insertedId.toString(), ...data })
      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  update: async (data, client) => {
    const routine = await update(data)
    if (routine?.insertedId) {
      updateRoom({ _id: routine.insertedId.toString(), ...data })

      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  },
  remove: async (data, client) => {
    const routine = await remove(data)
    if (routine?.deletedCount) {
      deleteRoom(data._id)

      const routines = await get()

      client.publish(topic, JSON.stringify(routines))
    }
  }
}
