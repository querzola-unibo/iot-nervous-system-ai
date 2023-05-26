const { create, update, remove, get } = require('../db/rooms')
const { createRoom, updateRoom, deleteRoom } = require('../status')

const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/rooms`

module.exports = {
  create: async (data, client) => {
    const room = await create(data)
    if (room?.insertedId) {
      createRoom({ id: room.insertedId.toString(), ...data })
      const rooms = await get()
      //client.publish(topic, JSON.stringify(rooms))
    }
  },
  update: async (data, client) => {
    const result = await update(data)

    if (result?.ok) {
      const { _id, ...props } = data
      updateRoom({ id: _id, ...props })

      const rooms = await get()

      client.publish(topic, JSON.stringify(rooms))
    }
  },
  remove: async (data, client) => {
    const room = await remove(data)
    if (room?.deletedCount) {
      deleteRoom(data.id)

      const rooms = await get()

      client.publish(topic, JSON.stringify(rooms))
    }
  }
}
