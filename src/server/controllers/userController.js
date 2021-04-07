const { ApplicationError } = require('../util/customErrors')

const getUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)

  res.send(user)
}

module.exports = {
  getUser,
}
