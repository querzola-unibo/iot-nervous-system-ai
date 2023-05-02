const { createHash } = require('crypto')

const createIdFromObject = (obj) => {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(obj))

  return hash.digest('base64')
}


module.exports = {
  createIdFromObject
}