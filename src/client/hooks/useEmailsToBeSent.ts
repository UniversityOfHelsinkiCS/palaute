import type { GetEmailsToBeSentResponse } from '@common/types/admin'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import apiClient from '../util/apiClient'

const emptyEmails: GetEmailsToBeSentResponse = {
  emails: [],
  studentEmails: 0,
  teacherEmails: 0,
  teacherEmailCounts: [],
  studentEmailCounts: [],
}

const queryFn = async () => {
  const { data } = await apiClient.get<GetEmailsToBeSentResponse>('/admin/emails')
  return data
}

const useEmailsToBeSent = () => {
  const [enabled, setEnabled] = useState(false)
  const queryKey = 'emailsToBeSent'

  const getTheEmails = () => {
    setEnabled(true)
  }

  const { data: emails } = useQuery({
    queryKey: [queryKey],
    queryFn,
    enabled,
  })

  return [emails ?? emptyEmails, getTheEmails] as const
}

export default useEmailsToBeSent
