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
  return user
}

export const clearHeaders = () => {
  localStorage.removeItem(ITEM_NAME)
}
