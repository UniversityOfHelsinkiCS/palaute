const _ = require('lodash')
const { startOfDay, subDays } = require('date-fns')
const {
  FeedbackTarget,
  User,
  Organisation,
  Survey,
  Question,
  CourseUnit,
  OrganisationFeedbackCorrespondent,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  FeedbackTargetLog,
} = require('../models')
const { UNIVERSITY_ROOT_ID } = require('../util/config')
const {
  TEST_ORGANISATION_ID,
  TEST_ORGANISATION_CODE,
  TEST_COURSE_UNIT_ID,
  TEST_COURSE_CODE,
  TEST_COURSE_REALISATION_ID,
} = require('./testIds')
const { createTestObject } = require('./utils')
const userCache = require('../services/users/cache')
const { feedbackTargetCache } = require('../services/feedbackTargets')

const CURRENT_YEAR = new Date().getFullYear()

const seedUsers = async users => {
  for (const user of users) {
    await User.findOrCreate({
      where: {
        id: user.id,
      },
      defaults: user,
    })
  }
}

const seedOrganisationCorrespondent = async user => {
  await OrganisationFeedbackCorrespondent.create({
    userId: user.id,
    organisationId: TEST_ORGANISATION_ID,
    userCreated: true,
  })
}

const seedUniversity = async () => {
  await Organisation.create(
    {
      id: UNIVERSITY_ROOT_ID,
      name: {
        fi: 'Testiyliopisto',
        en: 'Test university',
        sv: 'Testuniversitetet',
      },
      code: 'TEST_UNIVERSITY',
    },
    {
      hooks: false,
    }
  )

  const questionIds = await Promise.all(
    _.range(1, 6)
      .map(async idx => {
        const q = await Question.create({
          type: 'LIKERT',
          required: true,
          data: {
            label: {
              fi: `Testikysymys ${idx}`,
              en: `Test question ${idx}`,
              sv: `Testfråga ${idx}`,
            },
          },
        })
        return q.id
      })
      .concat(
        Question.create({
          type: 'OPEN',
          required: false,
          data: {
            label: {
              fi: `Avoin testikysymys`,
              en: `Open test question`,
              sv: `Öppen testfråga`,
            },
          },
        }).then(q => q.id)
      )
  )

  await Survey.create(
    {
      typeId: UNIVERSITY_ROOT_ID,
      type: 'university',
      questionIds,
    },
    {
      hooks: false,
    }
  )
}

const seedDb = async () => {
  // Reset caches
  await userCache.invalidateAll()
  await feedbackTargetCache.invalidateAll()

  // First reset all tables

  await FeedbackTargetLog.destroy({ where: {}, truncate: true, cascade: true })
  await FeedbackTarget.destroy({ where: {}, truncate: true, cascade: true })
  await User.destroy({ where: {}, truncate: true, cascade: true })
  await CourseRealisation.destroy({ where: {}, truncate: true, cascade: true })
  await CourseUnit.destroy({ where: {}, truncate: true, cascade: true })
  await Organisation.destroy({ where: {}, truncate: true, cascade: true })

  // Create university & university survey
  await seedUniversity()

  // Seed test organisation
  await createTestObject(Organisation, {
    id: TEST_ORGANISATION_ID,
    name: {
      fi: 'Testiorganisaatio',
      en: 'Test organisation',
      sv: 'asdasdasd',
    },
    code: TEST_ORGANISATION_CODE,
  })

  await createTestObject(CourseUnit, {
    id: TEST_COURSE_UNIT_ID,
    name: {
      fi: 'Testauskurssi',
      en: 'Testauskurssi',
      sv: 'asdasdasd',
    },
    courseCode: TEST_COURSE_CODE,
  })

  await createTestObject(CourseUnitsOrganisation, {
    courseUnitId: TEST_COURSE_UNIT_ID,
    organisationId: TEST_ORGANISATION_ID,
    type: 'PRIMARY',
  })

  await createTestObject(CourseRealisation, {
    id: TEST_COURSE_REALISATION_ID,
    name: {
      fi: 'Testauskurssin toteutus',
      en: 'Test course realisation',
      sv: 'asdasdasd',
    },
    startDate: startOfDay(new Date(`${CURRENT_YEAR}-01-01`)),
    endDate: startOfDay(startOfDay(subDays(new Date(), 1))),
  })

  await createTestObject(CourseRealisationsOrganisation, {
    courseRealisationId: TEST_COURSE_REALISATION_ID,
    organisationId: TEST_ORGANISATION_ID,
    type: 'PRIMARY',
  })
}

module.exports = {
  seedDb,
  seedUsers,
  seedOrganisationCorrespondent,
}
