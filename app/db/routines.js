const { collection, Id } = require('.')

const Routines = collection('routines')

const create = async ({ name, roomId, conditions, description, achievements, weight }) => {
  return Routines.insertOne({ name, roomId, conditions, description, achievements, weight })
}

const update = async ({ _id, ...fieldsToUpdate }) => {
  return Routines.findOneAndUpdate(
    { _id: new Id(_id) },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  return Routines.deleteOne({ _id: new Id(_id) })
}

const get = async ({ query } = {}) => {
  const queryOnRoutines = {}

  if (query) {
    queryOnRoutines.name = {
      $regex: new RegExp(`${query.trim()}`, 'i')
    }
  }

  return Routines.find(queryOnRoutines).toArray()
}

module.exports = {
  get,
  create,
  update,
  remove
}
