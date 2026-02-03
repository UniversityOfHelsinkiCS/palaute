import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { writeFileXLSX, utils } from 'xlsx'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getYearRange } from '../../util/yearUtils'
import { useOrganisationFeedbackTargets, getCourseRealisationName, generateTeacherStats } from './responsiblesUtils'

const ResponsiblesXlsx = () => {
  const { t, i18n } = useTranslation()
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const studyYearRange = getYearRange(new Date())
  const startDate = searchParams.get('startDate') || studyYearRange.start
  const endDate = searchParams.get('endDate') || studyYearRange.end

  const {
    data: feedbackTargets,
    isLoading,
    isSuccess,
  } = useOrganisationFeedbackTargets({
    code,
    startDate,
    endDate,
    enabled: startDate !== null,
  })

  useEffect(() => {
    if (!isSuccess || !feedbackTargets) return

    // Generate teacher stats
    const teacherStats = generateTeacherStats(feedbackTargets)

    // Generate detailed export
    const data = []

    // Headers
    data.push([
      t('common:lastName'),
      t('common:firstName'),
      t('common:code'),
      t('common:name'),
      t('organisationSettings:startDate'),
      t('organisationSettings:endDate'),
    ])

    // Data rows
    teacherStats.forEach(teacher => {
      teacher.feedbackTargets.forEach(fbt => {
        data.push([
          teacher.lastName,
          teacher.firstName,
          fbt.courseUnit.courseCode,
          getCourseRealisationName(fbt, i18n),
          new Date(fbt.courseRealisation.startDate).toLocaleDateString(i18n.language),
          new Date(fbt.courseRealisation.endDate).toLocaleDateString(i18n.language),
        ])
      })
    })

    const worksheet = utils.aoa_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, t('organisationSettings:detailed'))

    const fileName = `${code}_${t('organisationSettings:exportFilePrefix')}_${t('organisationSettings:detailed')}.xlsx`
    writeFileXLSX(workbook, fileName)

    // Redirect back to responsibles page after download
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const option = searchParams.get('option')
    if (option) params.set('option', option)

    navigate(`/organisations/${code}/responsibles?${params.toString()}`, { replace: true })
  }, [isSuccess, feedbackTargets, code, startDate, endDate, t, i18n, navigate, searchParams])

  if (isLoading) {
    return <LoadingProgress />
  }

  return null
}

export default ResponsiblesXlsx
