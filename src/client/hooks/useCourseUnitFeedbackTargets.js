import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useCourseUnitFeedbackTargets = (code, options = {}) => {
  const {
    courseRealisationStartDateAfter,
    courseRealisationStartDateBefore,
    courseRealisationEndDateAfter,
    courseRealisationEndDateBefore,
    feedbackType,
    includeSurveys,
    isOrganisationSurvey,
  } = options

  const queryKey = [
    'courseUnitFeedbackTargets',
    code,
    {
      courseRealisationStartDateAfter,
      courseRealisationStartDateBefore,
      courseRealisationEndDateAfter,
      courseRealisationEndDateBefore,
    },
  ]

  const params = {
    ...(courseRealisationStartDateAfter && {
      courseRealisationStartDateAfter: courseRealisationStartDateAfter.toISOString(),
    }),
    ...(courseRealisationStartDateBefore && {
      courseRealisationStartDateBefore: courseRealisationStartDateBefore.toISOString(),
    }),
    ...(courseRealisationEndDateAfter && {
      courseRealisationEndDateAfter: courseRealisationEndDateAfter.toISOString(),
    }),
    ...(courseRealisationEndDateBefore && {
      courseRealisationEndDateBefore: courseRealisationEndDateBefore.toISOString(),
    }),
    ...(feedbackType && { feedbackType }),
    ...(includeSurveys && {
      includeSurveys: includeSurveys ? 'true' : 'false',
    }),
    ...(isOrganisationSurvey && {
      isOrganisationSurvey: 'true',
    }),
  }

  // There are course codes that include slash character (/), which is problematic in req parameter
  // Slash is replaced with tilde (~) here and replaced back before querying database
  // Tilde should not be used in any course codes
  const safeCourseCode = code?.replace('/', '~')

  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/for-course-unit/${safeCourseCode}`, {
      params,
    })

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(code),
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useCourseUnitFeedbackTargets
