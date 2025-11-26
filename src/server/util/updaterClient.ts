import axios from 'axios'

import { UPDATER_URL } from './config'

const updaterClient0 = axios.create({
  baseURL: UPDATER_URL,
})

const ping = async () => {
  await updaterClient0.get('/ping')
}

const run = async () => {
  await updaterClient0.get('/run')
}

const updateEnrolments = async (id: string) => {
  await updaterClient0.post(`/enrolments/${id}`)
}

const deleteCourse = async (id: string) => {
  await updaterClient0.delete(`/courses/${id}`)
}

const updaterClient = { ping, run, updateEnrolments, deleteCourse }

export default updaterClient
