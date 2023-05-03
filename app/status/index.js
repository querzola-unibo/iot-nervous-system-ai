// const routines = require('./routines')
const rooms = require('./rooms')
const devices = require('./devices')

const initStatus = async () => {
  rooms.initRooms()
  // devices.initDevices()
  // routines.initRoutines()
}

module.exports = {
  //...routines,
  ...rooms,
  ...devices,
  initStatus
}
