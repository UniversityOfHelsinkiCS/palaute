import { useEffect, useState, useMemo } from 'react'

const useCustomUiConfig = configName => {
  const [customUiConfig, setCustomUiConfig] = useState(null)

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
