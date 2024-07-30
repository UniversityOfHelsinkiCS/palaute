import React from 'react'
import { CUSTOM_FOOTER_COMPONENT } from '../util/common'
import DefaultFooter from './Footer-default'

const componentName = CUSTOM_FOOTER_COMPONENT
if (!componentName) {
  throw new Error('No footer component found')
}

const Footer = ({ user }) => <DefaultFooter user={user} />

export default Footer
