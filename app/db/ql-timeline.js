
const { collection, Id } = require('.')
const { normalizeId } = require('./utils/ids')
const QLTimeline = collection('ql-timeline-test3-lambda-25')

const getMatchingActivitys = async (status) => {
	const query = {
		time: getCurrentTime()
	}

	query['$and'] = mapRooms(status).map(room => {
		const query = {rooms: {}}
		query.rooms['$elemMatch'] = room

		return query
	})

	return QLTimeline.find(query).toArray()
}

const getActivity = async (_id) => {
	const query = { _id: normalizeId(_id) }

	const states = await QLTimeline.find(query).toArray()

	return states[0]
}

const createActivity = async (activity) => {
	const newActivity = {...activity, createdAt: new Date() }
	console.log(newActivity)

	return QLTimeline.insertOne(newActivity)
}

const updateActivity = async ({ _id, ...fieldsToUpdate }) => {
	const query = { _id: normalizeId(_id) } 

  return QLTimeline.findOneAndUpdate(
    query,
    { $set: { ...fieldsToUpdate, updatedAt: Date().now() } },
    { returnDocument: 'after' }
  )
}

const removeActivity = async ({ _id }) => {
	const query = { _id: normalizeId(_id) }


  return QLTimeline.deleteOne(query)
}

module.exports = {
	getMatchingActivitys, 
	createActivity,
	getActivity,
  updateActivity,
  removeActivity
}