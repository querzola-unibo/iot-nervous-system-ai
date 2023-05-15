const { create, update, remove, get } = require('../db/routines')
const { MQTT_ROOT_TOPIC } = require('../utils/costants')

const topic = `${MQTT_ROOT_TOPIC}/routines`

module.exports = {
  create: async (data) => {
    await create(data)
  },
  update: async (data) => {
    await update(data) 
  },
  remove: async (data) => {
    await remove(data)
  }
}
