const ITEM_NAME = 'fakeUser'

export const setHeaders = uid => {
  localStorage.setItem(ITEM_NAME, JSON.stringify({ uid }))
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
