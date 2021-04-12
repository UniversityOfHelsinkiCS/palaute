const headersMiddleware = require('unfuck-utf8-headers-middleware')

const headers = [
  'uid',
  'givenname', // First name
  'sn', // Last name
  'mail', // Email
  'preferredlanguage',
  'hypersonsisuid',
]

module.exports = headersMiddleware(headers)
