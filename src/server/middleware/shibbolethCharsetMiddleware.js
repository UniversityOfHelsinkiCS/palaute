const headersMiddleware = require('unfuck-utf8-headers-middleware')

const headers = [
  'uid',
  'givenname', // First name
  'mail', // Email
  'schacpersonaluniquecode', // Contains student number
  'sn', // Last name
]

module.exports = headersMiddleware(headers)
