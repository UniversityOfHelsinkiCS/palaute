import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction } from './common'

/**
 * ApiConnection simplifies redux usage
 */

export const getAxios = axios.create({ baseURL: `${basePath}/api` })

// to clear some lint error :D
export const x = () => true

getAxios.interceptors.request.use((config) => {
  const defaultHeaders = !inProduction ? getHeaders() : {}
  const headers = { ...defaultHeaders }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // uid
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs
  const newConfig = { ...config, headers }
  return newConfig
})
