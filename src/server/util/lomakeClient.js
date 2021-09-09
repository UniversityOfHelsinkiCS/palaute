const axios = require('axios')

const lomakeClient = axios.create({
  baseURL: 'https://opetushallinto.cs.helsinki.fi/tilannekuva/api/external',
})

module.exports = lomakeClient
