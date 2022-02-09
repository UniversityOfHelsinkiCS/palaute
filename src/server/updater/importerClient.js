const axios = require('axios')

const { IMPORTER_API_URL, API_TOKEN } = require('../util/config')

const importerClient = axios.create({
  baseURL: IMPORTER_API_URL,
  params: {
    token: API_TOKEN,
  },
})

module.exports = importerClient
