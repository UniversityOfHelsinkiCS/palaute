type Listener = (message: string) => void

const listeners = new Set<Listener>()

export const subscribeToAnnouncements = (listener: Listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const announceSnackbar = (message: string) => {
  listeners.forEach(listener => listener(message))
}
