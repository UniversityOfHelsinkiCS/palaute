import { useEffect } from 'react'
// @ts-expect-error Because the package is not typed
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'

import { inProduction } from '../../util/common'

const useShibbolethPinger = () => {
  if (inProduction) {
    useEffect(() => {
      initShibbolethPinger()
    }, [])
  }
}

export default useShibbolethPinger
