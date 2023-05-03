const mqtt = require('mqtt')
const { MQTT_BROKER_URL, MQTT_ROOT_TOPIC, SUBSCRIBED_TOPICS } = require('./utils/costants')
const routes = require('./routes')

const { createIdFromObject } = require('./utils/ids')
const { getRooms, getDevices, initStatus } = require('./status')

initStatus()

const client = mqtt.connect(MQTT_BROKER_URL)


client.on('connect', connack => {
  console.log('Succesfully connected to MQTT broker!')
  SUBSCRIBED_TOPICS.forEach((topic) => client.subscribe(`${MQTT_ROOT_TOPIC}/${topic}/#`, { qos: 0 }, (err, granted) => {
    if (err) {
      console.err(`ERROR: failded to subscribe to topics: ${topics}`)
      console.error(err)
    }
  }))
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
      console.error(`ERROR: ${e}`)
    }
  }
})

client.on('error', error => {
  console.error({ error })
})

setInterval(async function () {
  const status = {
    rooms: getRooms(), 
    devices: getDevices()
  }

  client.publish(`${MQTT_ROOT_TOPIC}/status`, JSON.stringify({
    _id: createIdFromObject(status), 
    status
  }))
}, 5000)
