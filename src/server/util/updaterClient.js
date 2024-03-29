const axios = require('axios')

const { UPDATER_URL } = require('./config')

const updaterClient = axios.create({
  baseURL: UPDATER_URL,
})

const ping = async () => {
  await updaterClient.get('/ping')
}

const run = async () => {
  await updaterClient.get('/run')
}

const updateEnrolments = async id => {
  await updaterClient.post(`/enrolments/${id}`)
}

const deleteCourse = async id => {
  await updaterClient.delete(`/courses/${id}`)
}

module.exports = { run, ping, updateEnrolments, deleteCourse }
