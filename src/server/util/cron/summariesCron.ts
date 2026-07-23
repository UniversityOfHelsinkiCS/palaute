import { buildSummaries } from '../../services/summary/buildSummaries'
import { inProduction } from '../config'
import { schedule } from './schedule'

const run = async () => {
  await buildSummaries()
}

export const start = () => {
  const cronTime = '20 5 * * *' // 5:20 am

  if (inProduction) {
    schedule(cronTime, run)
  }
}
