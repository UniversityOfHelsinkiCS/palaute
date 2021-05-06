const ITEM_NAME = 'fakeUser'

export const possibleUsers = [
  {
    uid: 'mluukkai',
    givenName: 'Matti',
    mail: 'grp-toska+mockadmin@helsinki.fi',
    sn: 'Luukkainen',
    preferredLanguage: 'fi',
    hyPersonSisuId: 'hy-hlo-1441871',
  },
  {
    uid: 'varisleo',
    givenName: 'fuksiEtunimi',
    mail: 'grp-toska+mockstudent@helsinki.fi',
    schacDateOfBirth: 19770501,
    schacPersonalUniqueCode:
      'urn:schac:personalUniqueCode:int:studentID:helsinki.fi:fuksi',
    sn: 'fuksi',
    preferredLanguage: 'fi',
    hyPersonSisuId: 'hy-hlo-135680147',
    employeeNumber: '9431559',
  },
  {
    uid: 'jakousa',
    givenName: 'Jami',
    mail: 'grp-toska+mockstaff@helsinki.fi',
    sn: 'Kousa',
    preferredLanguage: 'fi',
    hyPersonSisuId: 'hy-hlo-96468666',
  },
  {
    uid: 'keolli',
    givenName: 'Olli',
    mail: 'grp-toska+mockstudent@helsinki.fi',
    sn: 'Keski-Hynnilä',
    preferredLanguage: 'en',
    hyPersonSisuId: 'hy-hlo-114841198',
  },
]

export const setHeaders = (uid) => {
  const user = possibleUsers.find((u) => u.uid === uid)
  if (!user) return

  localStorage.setItem(ITEM_NAME, JSON.stringify(user))
}

export const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem(ITEM_NAME) || '{}')
  return user
}

export const clearHeaders = () => {
  localStorage.removeItem(ITEM_NAME)
}
