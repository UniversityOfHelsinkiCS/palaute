const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { FeedbackTarget, CourseUnit, UserFeedbackTarget } = require('../models')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const createCourseUnit = async (data) => {
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
  })
}

const createFeedbackTargetWithUserTargetTable = async (upsertData, userId) => {
  const [feedbackTarget] = await FeedbackTarget.upsert(upsertData)
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

const createFeedbackTargetFromAssessmentItem = async (
  data,
  endDate,
  courseUnit,
  userId,
) => {
  await createCourseUnit(courseUnit)
  const course = await createFeedbackTargetWithUserTargetTable(
    {
      feedbackType: 'assessmentItem',
      typeId: data.id,
      courseUnitId: courseUnit.id,
      name: data.name,
      opensAt: formatDate(dateFns.subDays(endDate, 14)),
      closesAt: formatDate(dateFns.addDays(endDate, 14)),
    },
    userId,
  )
  return course
}

const createFeedbackTargetFromStudyGroup = async (
  data,
  endDate,
  courseUnitId,
) => {
  const [target] = await FeedbackTarget.upsert({
    feedbackType: 'studySubGroup',
    typeId: data.id,
    courseUnitId,
    name: data.name,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  return target
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  studySubGroupIds,
  courseUnitId,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  const studySubGroupItems = (
    await Promise.all(
      data.studyGroupSets.map(async (studySet) => {
        const studySetItems = await Promise.all(
          studySet.studySubGroups
            .filter((group) => studySubGroupIds.includes(group.id))
            .map(async (item) =>
              createFeedbackTargetFromStudyGroup(item, endDate, courseUnitId),
            ),
        )
        return studySetItems
      }),
    )
  ).flat()
  const [course] = await FeedbackTarget.upsert({
    feedbackType: 'courseRealisation',
    typeId: data.id,
    courseUnitId,
    name: data.name,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  studySubGroupItems.push(course)
  return studySubGroupItems
}

const createTargetsFromEnrolment = async (data, userId) => {
  const studySubGroupIds = data.studySubGroups.map(
    (group) => group.studySubGroupId,
  )

  const { courseUnitId, courseUnitRealisation, courseUnit } = data
  const endDate = dateFns.parse(
    courseUnitRealisation.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  await createCourseUnit(data.courseUnit)
  const assessmentItem = await createFeedbackTargetFromAssessmentItem(
    data.assessmentItem,
    endDate,
    courseUnit,
    userId,
  )

  const realisationItems = await createFeedbackTargetFromCourseRealisation(
    courseUnitRealisation,
    studySubGroupIds,
    courseUnitId,
  )
  realisationItems.push(assessmentItem)
  return realisationItems
}

const getOneTarget = (id) =>
  FeedbackTarget.findByPk(Number(id), {
    include: CourseUnit,
  })

const getEnrolmentByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(`/palaute/enrolled/${personId}`, {
    params,
  })
  const idsToFind = (
    await Promise.all(
      data.map(async (enrolment) =>
        createTargetsFromEnrolment(enrolment, personId),
      ),
    )
  )
    .flat()
    .map((target) => target.id)
  const targets = []

  // eslint-disable-next-line
  for (const id of idsToFind) {
    // eslint-disable-next-line no-await-in-loop
    targets.push(await getOneTarget(id))
  }

  return targets
}

module.exports = {
  getEnrolmentByPersonId,
}
