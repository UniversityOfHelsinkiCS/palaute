// This file contains all the data that will not be changed when resetting course data.
// This includes the test organisation, course_units_organisations, course unit and course unit realisation.
const { Organisation, CourseUnit, CourseUnitsOrganisation, CourseRealisation } = require('../models')

module.exports = {
  up: async () => {
    await Organisation.findOrCreate({
      where: {
        id: 'hy-org-test-1',
      },
      defaults: {
        id: 'hy-org-test-1',
        name: {
          fi: 'Testauksen kandiohjelma',
          en: "Bachelor's programme in testing",
        },
        code: '999-K321',
      },
    })
    await CourseUnit.findOrCreate({
      where: {
        id: 'hy-cu-test',
      },
      defaults: {
        id: 'hy-cu-test',
        name: {
          fi: 'Testikurssi',
          en: 'Test course',
        },
        courseCode: 'TEST-1',
        validityPeriod: {
          startDate: '2020-01-01',
          endDate: '2030-01-01',
        },
      },
    })
    await CourseUnitsOrganisation.findOrCreate({
      where: {
        courseUnitId: 'hy-cu-test',
      },
      defaults: {
        type: 'PRIMARY',
        courseUnitId: 'hy-cu-test',
        organisationId: 'hy-org-test-1',
      },
    })
    await CourseRealisation.findOrCreate({
      where: {
        id: 'hy-cur-test',
      },
      defaults: {
        id: 'hy-cur-test',
        name: {
          fi: 'Testi kurssitoteutus',
          en: 'Test course realisation',
        },
        endDate: '2021-08-01',
        startDate: '2021-06-01',
        educationalInstitutionUrn: 'hy',
      },
    })
  },
  down: async () => {
    await CourseRealisation.destroy({
      where: {
        id: 'hy-cur-test',
      },
    })
    await CourseUnitsOrganisation.destroy({
      where: {
        courseUnitId: 'hy-cu-test',
      },
    })
    await Organisation.destroy({
      where: {
        id: 'hy-org-test-1',
      },
    })
    await CourseUnit.destroy({
      where: {
        id: 'hy-cu-test',
      },
    })
  },
}
