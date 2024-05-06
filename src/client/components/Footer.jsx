import React, { lazy } from 'react'
import { CUSTOM_FOOTER_COMPONENT } from '../util/common'
import DefaultFooter from './Footer-default'

const componentName = CUSTOM_FOOTER_COMPONENT
if (!componentName) {
  throw new Error('No footer component found')
}
// const Component = lazy(() => import(`./${componentName}.jsx`))

const Footer = ({ user }) => <DefaultFooter user={user} />

export default Footer
