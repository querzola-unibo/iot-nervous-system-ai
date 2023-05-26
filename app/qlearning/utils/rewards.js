const getRangeBoundaries = ({ operator, values, min, max }) => {
	if(operator === 'EQUAL') {
		const value = parseInt(values[0])
		return [value, value]
	} else if (operator === 'BETWEEN') {
		const minValue = parseInt(values[0])
		const maxValue = parseInt(values[1])
		return [minValue, maxValue]
	} else if (operator === 'BELOW') {
		const value = parseInt(values[0])
		return [min, value]
	} else {
		const value = parseInt(values[0])
		return [value, max]
	}
}

const getRangeReward = (condition, rangeProps, value) => {
	const [lowerBound, upperBound] =  getRangeBoundaries({...rangeProps, ...condition})
  const { min, max } = rangeProps

	if(value >= lowerBound && value < upperBound) {
		return 1
	} else {
		let distanceFromRange

		if(value < lowerBound) {
			distanceFromRange = Math.abs(value - lowerBound)
		} else {
			distanceFromRange = Math.abs(value - upperBound)
		}

		const maxDistance = Math.max(Math.abs(lowerBound - min), Math.abs(upperBound - max))

		return (((distanceFromRange/maxDistance)/2) - 1) *(-1)
	}
}

const getTimeRangeReward = (condition, value) => {
  const [lowerBound, upperBound] = condition.values

	if(value >= lowerBound && value < upperBound) {
		return 1
	} else {
		let distanceFromRange

		if(value < lowerBound) {
			distanceFromRange = Math.abs(value - lowerBound)
		} else {
			distanceFromRange = Math.abs(value - upperBound)
		}

		const maxDistance = Math.max(Math.abs(lowerBound - 0), Math.abs(upperBound - 23))

		return (((distanceFromRange/maxDistance)/2) - 1) *(-1)
	}
}

const getBooleanReward = (condition, value) => {
  if (value === condition.value) {
		return 1
	}
	return -1
}

module.exports = {
	getRangeReward,
	getTimeRangeReward,
	getBooleanReward
}