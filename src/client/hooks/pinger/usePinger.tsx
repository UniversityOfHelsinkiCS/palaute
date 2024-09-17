import { useEffect, useMemo, useState } from 'react'

const usePinger = (pingerName: string) => {
  const [pinger, setPinger] = useState(null)

  useEffect(() => {
    import(`./Pinger-${pingerName}.tsx`).then(pingerModule => {
      if (pingerModule?.default) {
        setPinger(() => pingerModule?.default)
      }
    })
  }, [pingerName])

  return useMemo(() => pinger, [setPinger])
}

export default usePinger
