const headersMiddleware = require('unfuck-utf8-headers-middleware')

const headers = ['uid']

module.exports = headersMiddleware(headers)
