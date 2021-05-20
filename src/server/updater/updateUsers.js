const { User } = require('../models')
const mangleData = require('./updateLooper')

const userHandler = async (user) => {
  if (!user.id) return
  const firstName = user.firstNames ? user.firstNames.split(' ')[0] : null
  const { lastName, id, studentNumber } = user
  const username = user.eduPersonPrincipalName
    ? user.eduPersonPrincipalName.split('@')[0]
    : user.id

  await User.upsert({
    id,
    username,
    firstName,
    lastName,
    studentNumber,
  })
}

const updateUsers = async () => {
  await mangleData('persons', 3000, userHandler)
}

module.exports = updateUsers
