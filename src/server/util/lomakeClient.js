const axios = require('axios')

const lomakeClient = axios.create({
  baseURL: 'https://study.cs.helsinki.fi/tilannekuva/api/external',
})

module.exports = lomakeClient
