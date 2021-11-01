import { useState } from 'react'
import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const queryFn = async () => {
  const { data } = await apiClient.get(`/admin/emails`)

  return data
}

const useEmailsToBeSent = () => {
  const [enabled, setEnabled] = useState(false)
  const queryKey = 'emailsToBeSent'

  const getTheEmails = () => {
    setEnabled(true)
  }

  const { data: emails } = useQuery(queryKey, queryFn, { enabled })

  return [
    emails || {
      emails: [],
      teacherEmailCounts: [],
      studentEmailCounts: [],
      tokenPresent: false,
    },
    getTheEmails,
  ]
}

export default useEmailsToBeSent
