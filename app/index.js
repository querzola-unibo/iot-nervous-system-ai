const mqtt = require('mqtt')
const { MQTT_BROKER_URL, MQTT_ROOT_TOPIC } = require('./utils/costants')
const routes = require('./routes')

const client = mqtt.connect(MQTT_BROKER_URL)

client.on('connect', connack => {
  client.subscribe(`${MQTT_ROOT_TOPIC}/#`, { qos: 0 }, (err, granted) => {
    if (err) {
      console.err(err)
    }
  })
})

client.on('message', async (topic, payload, packet) => {
  const topicLevels = topic.replace(`${MQTT_ROOT_TOPIC}/`, '').split('/')

  let route = routes
  try {
    topicLevels.forEach(topicLevel => {
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
  // const result = await graph.findOne({})
  // console.log(result)
}, 5000)
