const ITEM_NAME = 'fakeUser'

export const setHeaders = uid => {
  localStorage.setItem(ITEM_NAME, JSON.stringify({ uid }))
}

export const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem(ITEM_NAME) || '{}')
  return user
}

export const clearHeaders = () => {
  localStorage.removeItem(ITEM_NAME)
}
