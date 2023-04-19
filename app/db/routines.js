const { collection } = require('.')

const Routines = collection('routines')

export const create = async ({ name, description, room }) => {
  return Routines.insertOne({ name, description, room })
}

export const update = async ({ _id, ...fieldsToUpdate }) => {
  return Routines.findOneAndUpdate(
    { _id },
    { $set: fieldsToUpdate },
    { returnDocument: 'after' }
  )
}

export const remove = async ({ _id }) => {
  return Routines.deleteOne({ _id })
}

export const get = async ({ query }) => {
  const queryOnRoutines = {}

  if (query) {
    queryOnRoutines.name = {
      $regex: new RegExp(`${query.trim()}`, 'i')
    }
  }

  return Routines.find(queryOnRoutines).toArray()
}
