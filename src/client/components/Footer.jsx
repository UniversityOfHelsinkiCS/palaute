import React from 'react'
import { CUSTOM_FOOTER_COMPONENT } from '../util/common'
import DefaultFooter from './Footer-default'
import TauFooter from './Footer-tau'

const componentName = CUSTOM_FOOTER_COMPONENT
if (!componentName) {
  throw new Error('No footer component found')
}
let FooterTmp

if (componentName === 'Footer-tau') {
  FooterTmp = ({ user }) => <TauFooter user={user} />
} else {
  FooterTmp = ({ user }) => <DefaultFooter user={user} />
}
const Footer = FooterTmp
export default Footer
