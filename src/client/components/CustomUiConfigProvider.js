import { createContext, useContext } from 'react'

const CustomUiConfig = createContext({})

export default CustomUiConfig.Provider

export function useUiConfig() {
  return useContext(CustomUiConfig)
}
