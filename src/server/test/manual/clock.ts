const RealDate = Date

// The manual videos run from a fixed moment, so the day they are recorded never changes what they show.
// The clock keeps running from it, null restores the real one.
export const setClock = (now: string | null) => {
  if (now === null) {
    globalThis.Date = RealDate
    return
  }
  const offset = new RealDate(now).getTime() - RealDate.now()
  const shiftedNow = () => RealDate.now() + offset

  globalThis.Date = new Proxy(RealDate, {
    construct: (target, args) => (args.length === 0 ? new target(shiftedNow()) : new (target as any)(...args)),
    apply: () => new RealDate(shiftedNow()).toString(),
    get: (target, prop) => (prop === 'now' ? shiftedNow : Reflect.get(target, prop)),
  })
}
