/* @ts-expect-error this lib has no types */
import headersMiddleware from 'unfuck-utf8-headers-middleware'

const headers = ['uid']

export const shibbolethCharsetMiddleware = headersMiddleware(headers)
