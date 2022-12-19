const axios = require('axios')

const { IAM_SERVICE_URL, API_TOKEN, inProduction } = require('./config')

const jamiClient = axios.create({
  baseURL: IAM_SERVICE_URL,
  params: {
    token: API_TOKEN,
    noLogging: !inProduction,
  },
})

module.exports = jamiClient
