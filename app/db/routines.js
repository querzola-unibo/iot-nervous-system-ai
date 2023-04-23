const { collection } = require('.')

const Routines = collection('routines')

const create = async ({ name, description, roomId }) => {
  return Routines.insertOne({ name, description, roomId })
}

const update = async ({ _id, ...fieldsToUpdate }) => {
  return Routines.findOneAndUpdate(
    { _id },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

const remove = async ({ _id }) => {
  return Routines.deleteOne({ _id })
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
