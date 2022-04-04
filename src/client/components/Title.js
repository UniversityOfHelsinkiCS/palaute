import React from 'react'
import { Helmet } from 'react-helmet'

const Title = ({ children }) => (
  <Helmet>
    <title>{children}</title>
  </Helmet>
)

export default Title
