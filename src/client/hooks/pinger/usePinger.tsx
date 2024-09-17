import { useEffect, useMemo, useState } from 'react'
import { CUSTOM_SESSION_PINGER } from '../../util/common'

const usePinger = () => {
  const [pinger, setPinger] = useState(null)

  useEffect(() => {
    import(`./Pinger-${CUSTOM_SESSION_PINGER}.tsx`).then(pingerModule => {
      if (pingerModule.default) setPinger(pingerModule.default)
    })
  }, [])

  return useMemo(() => pinger, [setPinger])
}

export default usePinger
