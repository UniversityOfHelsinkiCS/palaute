import cron from 'node-cron'

export const schedule = (cronTime: string, job: () => void) => {
  cron.schedule(cronTime, job, {
    scheduled: true,
    timezone: 'Europe/Helsinki',
  })
}
