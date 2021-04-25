const dateFns = require('date-fns')

const {
  FeedbackTarget,
  CourseUnit,
  UserFeedbackTarget,
  CourseRealisation,
} = require('../models')

const commonFeedbackName = {
  fi: 'Yleinen palaute kurssista',
  en: 'General feedback about the course',
  sv: '[SWEDISH, TODO]',
}

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const combineStudyGroupName = (firstPart, secondPart) => ({
  fi:
    firstPart.fi && secondPart.fi ? `${firstPart.fi}: ${secondPart.fi}` : null,
  en:
    firstPart.en && secondPart.en ? `${firstPart.en}: ${secondPart.en}` : null,
  sv:
    firstPart.sv && secondPart.sv ? `${firstPart.sv}: ${secondPart.sv}` : null,
})

const createCourseUnit = async (data) => {
  const sortedOrganisationIds = data.organisations
    .sort((a, b) => a.share - b.share)
    .map((org) => org.organisationId)
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
    courseCode: data.code,
    validityPeriod: data.validityPeriod,
    primaryOrganisationId: sortedOrganisationIds[0],
    organisationIds: sortedOrganisationIds,
  })
}

const makeCreateFeedbackTargetWithUserTargetTable = (accessStatus) => async (
  feedbackType,
  typeId,
  courseRealisationId,
  courseUnitId,
  name,
  endDate,
  startDate,
  userId,
) => {
  if (feedbackType === 'courseRealisation') {
    await CourseRealisation.upsert({
      id: courseRealisationId,
      endDate,
      startDate,
      name,
    })
  }

  const feedbackTargetName =
    feedbackType === 'courseRealisation' ? commonFeedbackName : name

  const hidden = !(feedbackType === 'courseRealisation')

  const [feedbackTarget] = await FeedbackTarget.findOrCreate({
    where: {
      feedbackType,
      typeId,
    },
    defaults: {
      feedbackType,
      typeId,
      courseUnitId,
      courseRealisationId,
      name: feedbackTargetName,
      hidden,
      opensAt: formatDate(dateFns.subDays(endDate, 14)),
      closesAt: formatDate(dateFns.addDays(endDate, 14)),
    },
  })
  await UserFeedbackTarget.findOrCreate({
    where: {
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
    defaults: {
      accessStatus,
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
  })
  return feedbackTarget
}

module.exports = {
  createCourseUnit,
  makeCreateFeedbackTargetWithUserTargetTable,
  combineStudyGroupName,
  formatDate,
}
