const getInitialStatus = async (db, acc) => {
	const results = await db.get()

	return results.reduce((acc, curr) => {
		const {_id, ...props} = curr

		acc[_id] = curr

		return acc
	}, acc)
}

module.exports = {
	getInitialStatus
}
