const ITEM_NAME = 'fakeUser'

export const possibleUsers = [
  {
    uid: 'admin',
    employeeNumber: undefined,
    givenName: 'adminEtunimi',
    mail: 'grp-toska+mockadmin@helsinki.fi',
    schacDateOfBirth: undefined,
    schacPersonalUniqueCode: undefined,
    sn: 'admin',
  },
  {
    uid: 'student',
    employeeNumber: undefined,
    givenName: 'fuksiEtunimi',
    mail: 'grp-toska+mockstudent@helsinki.fi',
    schacDateOfBirth: 19770501,
    schacPersonalUniqueCode:
      'urn:schac:personalUniqueCode:int:studentID:helsinki.fi:fuksi',
    sn: 'fuksi',
  },
  {
    uid: 'staff',
    employeeNumber: 1234,
    givenName: 'non-admin-staffEtunimi',
    mail: 'grp-toska+mockstaff@helsinki.fi',
    schacDateOfBirth: undefined,
    schacPersonalUniqueCode: undefined,
    sn: 'staff',
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
