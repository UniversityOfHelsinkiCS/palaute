import { CUSTOM_SESSION_PINGER } from '../../util/common'

const usePinger = async () => {
  const pinger = await import(`./Pinger-${CUSTOM_SESSION_PINGER}.tsx`)

  return pinger
}

export default usePinger
