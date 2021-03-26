import { buildAction } from '@grp-toska/apina'

export const getMessagesAction = () =>
  buildAction('messages', { url: '/messages' })

export const postMessageAction = (message) =>
  buildAction('messages', { url: '/messages', method: 'post', data: message })

export const deleteMessageAction = (id) =>
  buildAction('messages', { url: `/messages/${id}`, method: 'delete' }, id)
