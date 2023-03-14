/* eslint-disable func-names */
/**
 * # Define model extension functions separately
 *
 * Because we would like to reuse the code in 'models', we extract all the outside imports to here.
 *
 * Outside imports are: those not from libraries, util/config or dbConnection.
 *
 * For example, services must be called from here.
 *
 * This file then must be required somewhere. Server root index.js seems like a good place.
 *
 * And if one does not need the extension functions and doesnt have their dependency modules, just dont require this.
 */

const { Op } = require('sequelize')
const { getOrganisationAccess } = require('../services/organisationAccess')
const {
  getUniversitySurvey,
  getOrCreateTeacherSurvey,
  getProgrammeSurveysByCourseUnit,
} = require('../services/surveys')
const FeedbackTarget = require('./feedbackTarget')
const Organisation = require('./organisation')
const User = require('./user')
const UserFeedbackTarget = require('./userFeedbackTarget')

FeedbackTarget.prototype.getSurveys = async function () {
  const [programmeSurveys, teacherSurvey, universitySurvey] = await Promise.all([
    getProgrammeSurveysByCourseUnit(this.courseUnitId),
    getOrCreateTeacherSurvey(this),
    getUniversitySurvey(),
  ])

  return {
    programmeSurveys,
    teacherSurvey,
    universitySurvey,
  }
}

User.prototype.getOrganisationAccess = async function () {
  const organisationAccess = await getOrganisationAccess(this)

  const organisations = await Organisation.findAll({
    where: {
      code: {
        [Op.in]: Object.keys(organisationAccess),
      },
    },
    include: {
      model: User,
      as: 'users',
      attributes: ['id', 'firstName', 'lastName', 'email'],
    },
  })

  return organisations.map(org => ({
    access: organisationAccess[org.code],
    organisation: org,
  }))
}

User.prototype.feedbackTargetsHasTeacherAccessTo = function () {
  return FeedbackTarget.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      where: {
        userId: this.id,
        accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
      },
      required: true,
    },
  })
}
