const mqtt = require('mqtt')
const { collection } = require('./db')
const { MQTT_BROKER_URL, MQTT_ROOT_TOPIC } = require('./utils/costants')

const graph = collection('graph')

const client = mqtt.connect(MQTT_BROKER_URL)

client.on('connect', connack => {
  client.subscribe(`${MQTT_ROOT_TOPIC}/#`, { qos: 0 }, (err, granted) => {
    if (err) {
      console.err(err)
    }
  })
})

client.on('message', async (topic, payload, packet) => {
  console.log({ topic, payload, packet })
  if (topic === '') {
    await graph.insertOne({ name: 'spot', kind: 'dog' })
  }
})

client.on('error', error => {
  console.error({ error })
})

setInterval(async function () {
  const result = await graph.findOne({})
  console.log(result)
}, 5000)
