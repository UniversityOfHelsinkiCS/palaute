const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const {
  FeedbackTarget,
  CourseUnit,
  UserFeedbackTarget,
  CourseRealisation,
} = require('../models')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const commonFeedbackName = {
  fi: 'Yleinen palaute kurssista',
  en: 'General feedback about the course',
  sv: '[SWEDISH, TODO]',
}

const combineStudyGroupName = (firstPart, secondPart) => ({
  fi:
    firstPart.fi && secondPart.fi ? `${firstPart.fi}: ${secondPart.fi}` : null,
  en:
    firstPart.en && secondPart.en ? `${firstPart.en}: ${secondPart.en}` : null,
  sv:
    firstPart.sv && secondPart.sv ? `${firstPart.sv}: ${secondPart.sv}` : null,
})

const createCourseUnit = async (data) => {
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
  })
}

const createFeedbackTargetWithUserTargetTable = async (
  feedbackType,
  typeId,
  courseRealisationId,
  courseUnitId,
  name,
  endDate,
  userId,
) => {
  if (feedbackType === 'courseRealisation') {
    await CourseRealisation.upsert({
      id: courseRealisationId,
      endDate,
      name,
    })
  }

  const feedbackTargetName =
    feedbackType === 'courseRealisation' ? commonFeedbackName : name

  const hidden = !(feedbackType === 'courseRealisation')

  const [feedbackTarget] = await FeedbackTarget.upsert({
    feedbackType,
    typeId,
    courseUnitId,
    courseRealisationId,
    name: feedbackTargetName,
    hidden,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  await UserFeedbackTarget.findOrCreate({
    where: {
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
    defaults: {
      accessStatus: 'STUDENT',
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
  })
  return feedbackTarget
}

const createFeedbackTargetFromStudyGroup = async (
  data,
  endDate,
  courseUnitId,
  realisationId,
  userId,
  setName,
) => {
  const target = await createFeedbackTargetWithUserTargetTable(
    'studySubGroup',
    data.id,
    realisationId,
    courseUnitId,
    combineStudyGroupName(setName, data.name),
    endDate,
    userId,
  )
  return target
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  studySubGroupIds,
  courseUnitId,
  userId,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  await createFeedbackTargetWithUserTargetTable(
    'courseRealisation',
    data.id,
    data.id,
    courseUnitId,
    data.name,
    endDate,
    userId,
  )
  await data.studyGroupSets.reduce(async (prom, studySet) => {
    await prom
    const setName = studySet.name
    await studySet.studySubGroups
      .filter((group) => studySubGroupIds.includes(group.id))
      .reduce(async (promise, item) => {
        await promise
        await createFeedbackTargetFromStudyGroup(
          item,
          endDate,
          courseUnitId,
          data.id,
          userId,
          setName,
        )
      }, Promise.resolve())
  }, Promise.resolve())
}

const createTargetsFromEnrolment = async (data, userId) => {
  const studySubGroupIds = data.studySubGroups.map(
    (group) => group.studySubGroupId,
  )

  const { courseUnitId, courseUnitRealisation, courseUnit } = data
  await createCourseUnit(courseUnit)

  await createFeedbackTargetFromCourseRealisation(
    courseUnitRealisation,
    studySubGroupIds,
    courseUnitId,
    userId,
  )
}

// this doesn't return anything, it is easier to do separate query for that
const getEnrolmentByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(`/palaute/enrolled/${personId}`, {
    params,
  })

  await data.reduce(async (promise, enrolment) => {
    await promise
    await createTargetsFromEnrolment(enrolment, personId)
  }, Promise.resolve())
}

module.exports = {
  getEnrolmentByPersonId,
}
