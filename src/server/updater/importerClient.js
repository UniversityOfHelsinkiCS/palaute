const axios = require('axios')

const { IMPORTER_API_URL, IMPORTER_API_TOKEN } = require('../util/config')

const importerClient = axios.create({
  baseURL: IMPORTER_API_URL,
  params: {
    token: IMPORTER_API_TOKEN,
  },
})

module.exports = importerClient
