const MQTT_BROKER_URL = 'mqtt://test.mosquitto.org'

const MQTT_ROOT_TOPIC = 'iot-nervous-system'

const TOPICS = {
  rooms: {
    create: '',
    update: '',
    delete: ''
  },
  devices: {
    create: '',
    update: '',
    delete: '',
    set: ''
  }
}

module.exports = {
  MQTT_BROKER_URL,
  MQTT_ROOT_TOPIC,
  TOPICS
}
