const { ApplicationError } = require('../util/customErrors')

const getUser = async (req, res) => {
  const { user } = req
  console.log('user', user)
  if (!user) throw new ApplicationError('Not found', 404)

  res.send(user)
}

module.exports = {
  getUser,
}
