const ITEM_NAME = 'fakeUser'

export const possibleUsers = [
  {
    uid: 'mluukkai',
  },
  {
    uid: 'varisleo',
  },
  {
    uid: 'jakousa',
  },
  {
    uid: 'keolli',
  },
]

export const setHeaders = (uid) => {
  const user = possibleUsers.find((u) => u.uid === uid)
  if (!user) return

  localStorage.setItem(ITEM_NAME, JSON.stringify(user))
}

export const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem(ITEM_NAME) || '{}')
  const en = localStorage.getItem('employeenumber')
  const employeenumber = String(en)
  return { ...user, employeenumber }
}

export const clearHeaders = () => {
  localStorage.removeItem(ITEM_NAME)
}
