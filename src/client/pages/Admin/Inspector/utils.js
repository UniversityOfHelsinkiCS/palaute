export const parseDates = feedbackTargets =>
  feedbackTargets.map(fbt => ({
    ...fbt,
    opensAt: new Date(fbt.opensAt),
    closesAt: new Date(fbt.closesAt),
    courseRealisation: {
      ...fbt.courseRealisation,
      startDate: new Date(fbt.courseRealisation.startDate),
      endDate: new Date(fbt.courseRealisation.endDate),
    },
  }))
