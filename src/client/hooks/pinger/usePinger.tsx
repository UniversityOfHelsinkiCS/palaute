import useShibbolethPinger from './Pinger-shibboleth'
import useDefaultPinger from './Pinger-default'

const usePinger = (pingerName: 'Pinger-default' | 'Pinger-shibboleth') => {
  const PingerHooks = {
    'Pinger-default': useDefaultPinger,
    'Pinger-shibboleth': useShibbolethPinger,
  }

  const pingerHook = PingerHooks[pingerName]

  pingerHook()
}

export default usePinger
