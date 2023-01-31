const axios = require('axios')

const { IMPORTER_API_URL, API_TOKEN } = require('../util/config')

const importerClient = axios.create({
  baseURL: IMPORTER_API_URL,
  params: {
    token: API_TOKEN,
  },
})

const fetchData = async (url, params) => {
  const { data } = await importerClient.get(`palaute/updater/${url}`, {
    params,
  })
  return data
}

module.exports = { fetchData }
