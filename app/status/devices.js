const UNAUTHORIZED_DEVICES = {}

const getAunothorizedDeviceIds = () => Object.keys(UNAUTHORIZED_DEVICES)

const getAunothorizedDevice = (id) => UNAUTHORIZED_DEVICES[id]

const addAunothorizedDevice = (device) => {
  const {deviceId, ...props} = device
  if(!UNAUTHORIZED_DEVICES[deviceId]) { 
    UNAUTHORIZED_DEVICES[deviceId] = props
  }
}

const deleteAunothorizedDevice = (id) => delete UNAUTHORIZED_DEVICES[id]


module.exports = {
  getAunothorizedDeviceIds,
  getAunothorizedDevice,
  addAunothorizedDevice,
  deleteAunothorizedDevice
}
