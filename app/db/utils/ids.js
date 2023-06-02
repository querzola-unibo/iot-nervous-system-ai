
const { Id } = require('..')

const normalizeId = (_id) => {
  if(typeof _id === 'string') {
	 return new Id(_id) 
	}

  return _id
}

module.exports = {
	normalizeId
}