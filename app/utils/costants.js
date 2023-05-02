const MQTT_BROKER_URL = 'mqtt://test.mosquitto.org'

const MQTT_ROOT_TOPIC = 'iot-nervous-system'

const SUBSCRIBED_TOPICS = ['rooms', 'devices', 'routines']

module.exports = {
  MQTT_BROKER_URL,
  MQTT_ROOT_TOPIC,
  SUBSCRIBED_TOPICS
}
