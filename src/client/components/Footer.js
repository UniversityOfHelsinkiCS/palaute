import React, { useState, useEffect } from 'react'
import { CUSTOM_FOOTER_COMPONENT } from '../util/common'

const Footer = ({ user }) => {
  const [FooterComponent, setFooterComponent] = useState(null)

  useEffect(() => {
    const loadComponent = async () => {
      const componentName = CUSTOM_FOOTER_COMPONENT
      if (!componentName) {
        throw new Error('No footer component found')
      }
      const { default: Component } = await import(`./${componentName}`)
      setFooterComponent(<Component user={user} />)
    }

    loadComponent()
  }, [])

  return FooterComponent
}

export default Footer
