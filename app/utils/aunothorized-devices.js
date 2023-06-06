const UNAUTHORIZED_DEVICES = {}

const getIds = () => Object.keys(UNAUTHORIZED_DEVICES)

const get = (id) => UNAUTHORIZED_DEVICES[id]

const add = (device) => {
  const {deviceId, ...props} = device
  if(!UNAUTHORIZED_DEVICES[deviceId]) { 
    UNAUTHORIZED_DEVICES[deviceId] = props
  }
}

const remove = (id) => delete UNAUTHORIZED_DEVICES[id]


module.exports = {
  getIds,
  get,
  add,
  remove
}
