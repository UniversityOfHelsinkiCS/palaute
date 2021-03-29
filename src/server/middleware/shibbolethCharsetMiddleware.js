const headersMiddleware = require('unfuck-utf8-headers-middleware')

const headers = [
  'uid',
  'givenname', // First name
  'mail', // Email
  'sn', // Last name
]

module.exports = headersMiddleware(headers)
