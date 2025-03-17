import { useEffect } from 'react'
// @ts-expect-error Because the package is not typed
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'

import { inProduction, inStaging } from '../../util/common'

const useShibbolethPinger = () => {
  useEffect(() => {
    if (inProduction || inStaging) {
      initShibbolethPinger()
    }
  }, [])
}

export default useShibbolethPinger
