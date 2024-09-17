import { useEffect } from 'react'
// @ts-expect-error Because the package is not typed
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'

import { inProduction, inStaging } from '../../util/common'

const useShibbolethPinger = () => {
  if (inProduction || inStaging) {
    useEffect(() => {
      initShibbolethPinger()
    }, [])
  }
}

export default useShibbolethPinger
