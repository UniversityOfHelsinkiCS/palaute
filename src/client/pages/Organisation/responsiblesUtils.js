import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash-es'
import apiClient from '../../util/apiClient'

export const organisationFeedbackTargetsQueryFn = async (code, startDate, endDate) => {
  const { data: feedbackTargets } = await apiClient.get(`/feedback-targets/for-organisation/${code}`, {
    params: { startDate, endDate },
  })

  return feedbackTargets
}

export const useOrganisationFeedbackTargets = ({ code, startDate, endDate, enabled }) => {
  const queryKey = ['organisationFeedbackTargets', code, startDate, endDate]

  return useQuery({
    queryKey,
    queryFn: () => organisationFeedbackTargetsQueryFn(code, startDate, endDate),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const useFacultyFeedbackTargets = ({ code, startDate, endDate, enabled }) => {
  const queryKey = ['facultyFeedbackTargets', code, startDate, endDate]

  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(`/feedback-targets/for-faculty/${code}`, {
      params: { startDate, endDate },
    })

    return feedbackTargets
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const getCourseRealisationName = (fbt, i18n) => {
  const name =
    fbt.courseRealisation.name[i18n.language] ||
    fbt.courseRealisation.name.fi ||
    fbt.courseRealisation.name.en ||
    fbt.courseRealisation.name.sv

  // Check for pattern "X | X, Y" and convert to "X, Y"
  const parts = name.split(' | ')
  if (parts.length === 2 && parts[1].startsWith(`${parts[0]}, `)) {
    return parts[1]
  }

  return name
}

export const generateTeacherStats = feedbackTargets => {
  if (!feedbackTargets || !Array.isArray(feedbackTargets)) return []

  const stats = new Map()

  feedbackTargets.forEach(([, months]) => {
    if (!Array.isArray(months)) return

    months.forEach(([, days]) => {
      if (!Array.isArray(days)) return

      days.forEach(([, fbts]) => {
        if (!Array.isArray(fbts)) return

        fbts.forEach(fbt => {
          if (fbt.responsibleTeachers && Array.isArray(fbt.responsibleTeachers)) {
            fbt.responsibleTeachers.forEach(teacher => {
              if (stats.has(teacher.id)) {
                stats.get(teacher.id).count++
                stats.get(teacher.id).feedbackTargets.push(fbt)
              } else {
                stats.set(teacher.id, {
                  id: teacher.id,
                  firstName: teacher.firstName,
                  lastName: teacher.lastName,
                  email: teacher.email,
                  count: 1,
                  feedbackTargets: [fbt],
                })
              }
            })
          }
        })
      })
    })
  })

  return orderBy(Array.from(stats.values()), ['lastName', 'firstName'], ['asc', 'asc'])
}
