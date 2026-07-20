import { useEffect, useState, useMemo } from 'react'

const useCustomUiConfig = (configName?: string) => {
  const [customUiConfig, setCustomUiConfig] = useState<unknown>(null)

  useEffect(() => {
    if (configName) {
      import(`../config/${configName}.js`).then(uiConfigModule => {
        if (uiConfigModule?.default) setCustomUiConfig(uiConfigModule?.default)
      })
    }
  }, [configName])

  return useMemo(() => customUiConfig, [customUiConfig])
}

export default useCustomUiConfig
