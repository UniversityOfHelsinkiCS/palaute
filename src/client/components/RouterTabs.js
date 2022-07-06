import React from 'react'
import Tabs from '@mui/material/Tabs'
import { useLocation, matchPath } from 'react-router-dom'
import { get } from 'lodash'

const RouterTabs = ({ children, ...props }) => {
  const { pathname } = useLocation()

  const activeIndex = React.Children.toArray(children)
    .filter((c) => React.isValidElement(c))
    .findIndex((c) => !!matchPath(pathname, { path: get(c, 'props.to') }))

  return (
    <Tabs value={activeIndex < 0 ? 0 : activeIndex} {...props}>
      {children}
    </Tabs>
  )
}

export default RouterTabs
