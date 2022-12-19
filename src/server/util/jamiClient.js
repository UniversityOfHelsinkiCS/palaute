const axios = require('axios')

const { IAM_SERVICE_URL, API_TOKEN } = require('./config')

const jamiClient = axios.create({
  baseURL: IAM_SERVICE_URL,
  params: {
    token: API_TOKEN,
  },
})

module.exports = jamiClient
