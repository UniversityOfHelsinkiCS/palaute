import { buildAction } from '@grp-toska/apina'

export const submitFormAction = () =>
  buildAction('form', { url: '/form', method: 'post' })

// to avoid eslint default export errors
export const updateFormAction = () =>
  buildAction('form', { url: '/form', method: 'post' })
