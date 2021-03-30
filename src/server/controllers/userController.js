const { ApplicationError } = require('../util/customErrors')

const getUser = async (req, res) => {
  const { currentUser } = req

  if (!currentUser) throw new ApplicationError('Not found', 404)

  res.send(currentUser)
}

module.exports = {
  getUser
}