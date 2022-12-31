const parse = groupString => {
  if (!groupString) {
    return []
  }

  return groupString.split(';').filter(Boolean)
}

const iamGroupsMiddleware = (req, res, next) => {
  req.iamGroups = parse(req.headers.hygroupcn)

  next()
}

module.exports = iamGroupsMiddleware
