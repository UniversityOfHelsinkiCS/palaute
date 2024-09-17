import { useEffect, useState } from 'react'

const usePinger = (pingerName: string) => {
  const [pinger, setPinger] = useState<(() => void) | null>(null)

  useEffect(() => {
    let isMounted = true

    import(`./Pinger-${pingerName}.tsx`)
      .then(pingerModule => {
        if (pingerModule?.default && typeof pingerModule.default === 'function' && isMounted) {
          setPinger(() => pingerModule.default)
        }
      })
      .catch(error => {
        throw new Error(`Failed to load the pinger: ${pingerName}`, error)
      })

    return () => {
      isMounted = false
      setPinger(null)
    }
  }, [pingerName])

  useEffect(() => {
    if (typeof pinger === 'function') {
      pinger()

      console.log(`Pinger ${pingerName} is running`)
    }
  }, [pinger])
}

export default usePinger
