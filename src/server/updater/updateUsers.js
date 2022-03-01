const { User } = require('../models')
const mangleData = require('./updateLooper')

const usersHandler = async (users) => {
  const parsePreferredLanguageUrnToLanguage = (urn) => {
    const fallBackLanguage = 'en'
    if (!urn) return fallBackLanguage
    const possibleLanguages = ['fi', 'en', 'sv']
    const splitArray = urn.split(':')
    const language = splitArray[splitArray.length - 1]
    return possibleLanguages.includes(language) ? language : fallBackLanguage
  }

  const filteredUsers = users.map((user) => ({
    ...user,
    email: user.primaryEmail ? user.primaryEmail : user.secondaryEmail,
    language: parsePreferredLanguageUrnToLanguage(user.preferredLanguageUrn),
    firstName: user.firstNames ? user.firstNames.split(' ')[0] : null,
    username: user.eduPersonPrincipalName
      ? user.eduPersonPrincipalName.split('@')[0]
      : user.id,
    degreeStudyRight: user.has_study_right,
  }))

  // By default updates all fields on duplicate id
  await User.bulkCreate(filteredUsers, {
    updateOnDuplicate: [
      'firstName',
      'username',
      'lastName',
      'studentNumber',
      'employeeNumber',
      'language',
      'email',
      'degreeStudyRight',
    ],
  })
}

const updateUsers = async () => {
  await mangleData('persons', 1000, usersHandler)
}

module.exports = updateUsers
