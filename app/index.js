const mqtt = require('mqtt')
const { MQTT_BROKER_URL, MQTT_ROOT_TOPIC, SUBSCRIBED_TOPICS } = require('./utils/costants')
const routes = require('./routes')

const { createIdFromObject } = require('./utils/ids')
const Routines = require('./db/routines')
const Devices = require('./db/devices')
const Rooms = require('./db/rooms')
const AunothorizedDevice = require('./utils/aunothorized-devices')

const { qLearning } = require('./qlearning')

const client = mqtt.connect(MQTT_BROKER_URL)

client.on('connect',async (connack) => {
  console.log('Succesfully connected to MQTT broker!')
  SUBSCRIBED_TOPICS.forEach((topic) => client.subscribe(`${MQTT_ROOT_TOPIC}/${topic}/#`, { qos: 0 }, (err, granted) => {
    if (err) {
      console.err(`ERROR: failded to subscribe to topics: ${topics}`)
      console.error(err)
    }
  }))

  await Devices.disconnectAll()
  client.publish(`${MQTT_ROOT_TOPIC}/reconnect`)

  const rooms = await Rooms.get()
  client.publish(`${MQTT_ROOT_TOPIC}/rooms`, JSON.stringify(rooms), { retain: true })

  const devices = await Devices.get({ connected: true })
  client.publish(`${MQTT_ROOT_TOPIC}/devices`, JSON.stringify(devices), { retain: true })

  const unauthorizedDevices = AunothorizedDevice.getIds()
  client.publish(`${MQTT_ROOT_TOPIC}/unauthorizedDevices`, JSON.stringify(unauthorizedDevices), { retain: true })

  const routines = await Routines.get()
  client.publish(`${MQTT_ROOT_TOPIC}/routines`, JSON.stringify(routines), { retain: true })
})

client.on('message', async (topic, payload, packet) => {
  const topicLevels = topic.replace(`${MQTT_ROOT_TOPIC}/`, '').split('/')

  let route = routes
  try {
    topicLevels.forEach(topicLevel => {
      if(!route[topicLevel]) {
        throw new Error()
      }

      route = route[topicLevel]
    })
  } catch (e) {
    console.error(`WARNING: No routes for topic: ${topic}`)
  }

  if (typeof route === 'function') {
    try {
      await route(JSON.parse(payload.toString()), client)
    } catch (e) {
      console.error(`ERROR:\nOn topic: ${topic}\nMessage: ${e}`)
    }
  }
})

client.on('error', error => {
  console.error({ error })
})

setInterval(async function () {
  qLearning(client)
}, 25000)
