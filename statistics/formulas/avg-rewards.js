const fs = require('fs');
const moment = require('moment')
const { getActivities } = require('../../app/db/ql-timeline')

const FILE_NAME = "../outputs/avg-rewards.json"

const getAvgRewards = async () => {
  const limit = 100
  let offset = 0
  let activities = []
  const result = []

  do {
    activities = await getActivities({}, limit, offset)
    offset += limit

    for(let i = 0; i < activities.length; i++){
      const activity = activities[0]
      const date = activity.createdAt
      
      if(!result.length) {
        result.push({
          step: 1,
          routinesReward: activity.routinesReward,
          energyReward: activity.energyReward,
          lastReward: activity.finalReward,
          rewardSum: activity.finalReward,
          avgReward: activity.finalReward,
          timeInterval: Math.floor((date.getHours())/ 6), 
          day: date.getDay()
        })
      } else {
        const sum = result[result.length - 1 ].rewardSum + activity.finalReward
        result.push({
          step: result.length + 1,
          routinesReward: activity.routinesReward,
          energyReward: activity.energyReward,
          rewardSum: sum,
          avgReward: sum/(result.length + 1),
          lastReward: activity.finalReward,

          timeInterval: Math.floor((date.getHours())/ 6), 
          day: date.getDay()
        })
      }
    }
  } while (activities.length === limit)

  await createFile(result)
}

const createFile = async (json) => {
  await fs.writeFile(FILE_NAME, JSON.stringify(json), (err) => console.error(err));
}

getAvgRewards()