import React, { lazy } from 'react'
import { CUSTOM_FOOTER_COMPONENT } from '../util/common'

const componentName = "Footer-default.jsx"
if (!componentName) {
  throw new Error('No footer component found')
}
const Component = lazy(() => import(`./${componentName}`))

const Footer = ({ user }) => <Component user={user} />

export default Footer
