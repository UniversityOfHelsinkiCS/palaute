import React from 'react'
import { Redirect } from 'react-router-dom'

import { ADMINS } from '../../util/common'
import { useUserData } from '../../util/queries'

const AdminView = () => {
  const user = useUserData()

  if (!ADMINS.includes(user?.data?.username)) return <Redirect to="/" />

  return (
    <>
      <h1>Admin page</h1>
    </>
  )
}

export default AdminView
