
const { collection, Id } = require('.')
const { normalizeId } = require('./utils/ids')
const QLTimeline = collection('ql-timeline-test-lambda-75')

const getMatchingActivities = async (status) => {
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

const getActivities = async (query, limit = 100, offset = 0) => {
	return QLTimeline
		.find(query)
		.sort({"createdAt": 1})
		.skip(offset)
		.limit(limit)
		.toArray()
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
	getMatchingActivities, 
	createActivity,
	getActivities,
	getActivity,
  updateActivity,
  removeActivity
}