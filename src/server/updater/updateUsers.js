const { User } = require('../models')
const mangleData = require('./updateLooper')

const usersHandler = async (users) => {
  const filteredUsers = users.map((user) => ({
    ...user,
    firstName: user.firstNames ? user.firstNames.split(' ')[0] : null,
    username: user.eduPersonPrincipalName
      ? user.eduPersonPrincipalName.split('@')[0]
      : user.id,
  }))

  // By default updates all fields on duplicate id
  await User.bulkCreate(filteredUsers, {
    updateOnDuplicate: [
      'firstName',
      'username',
      'lastName',
      'studentNumber',
      'employeeNumber',
    ],
  })
}

const updateUsers = async () => {
  await mangleData('persons', 3000, usersHandler)
}

module.exports = updateUsers
