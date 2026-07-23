import type { ProfilerOnRenderCallback, ReactNode } from 'react'

import React, { Profiler } from 'react'

const onRenderCallback: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  // eslint-disable-next-line no-console
  console.log(id, phase, `${actualDuration} ms`, baseDuration, startTime, commitTime)
}

export const RenderProfiler = ({ id, children }: { id: string; children: ReactNode }) => (
  <Profiler id={id} onRender={onRenderCallback}>
    {children}
  </Profiler>
)
