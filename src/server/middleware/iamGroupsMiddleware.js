const { IAM_GROUPS_HEADER } = require('../util/config')

const parse = groupString => {
  if (!groupString) {
    return []
  }

  return groupString.split(';').filter(Boolean)
}

const iamGroupsMiddleware = (req, res, next) => {
  req.iamGroups = parse(req.headers[IAM_GROUPS_HEADER])

  next()
}

module.exports = iamGroupsMiddleware
