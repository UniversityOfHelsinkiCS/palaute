/* eslint-disable no-unused-vars */
import React, { Profiler } from 'react'

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  // Aggregate or log render timings...
  // eslint-disable-next-line no-console
  console.log(id, phase, `${actualDuration} ms`)
}

export const RenderProfiler = ({ id, children }) => (
  <Profiler id={id} onRender={onRenderCallback}>
    {children}
  </Profiler>
)
