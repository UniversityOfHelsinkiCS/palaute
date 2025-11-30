import _ from 'lodash'
import { startOfDay, subDays } from 'date-fns'
import {
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
} from '../models'
import { UNIVERSITY_ROOT_ID } from '../util/config'
import {
  TEST_ORGANISATION_ID,
  TEST_ORGANISATION_CODE,
  TEST_COURSE_UNIT_ID,
  TEST_COURSE_CODE,
  TEST_COURSE_REALISATION_ID,
} from './testIds'
import { createTestObject } from './utils'
import { userCache } from '../services/users/cache'
import feedbackTargetCache from '../services/feedbackTargets/feedbackTargetCache'

const CURRENT_YEAR = new Date().getFullYear()

export const seedUsers = async (users: { id: string }[]) => {
  for (const user of users) {
    await User.findOrCreate({
      where: {
        id: user.id,
      },
      defaults: user,
    })
  }
}

export const seedOrganisationCorrespondent = async (user: { id: string }) => {
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
              fi: 'Avoin testikysymys',
              en: 'Open test question',
              sv: 'Öppen testfråga',
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

export const seedDb = async () => {
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
