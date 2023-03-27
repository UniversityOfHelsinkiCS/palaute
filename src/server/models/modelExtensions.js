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
const { getOrganisationAccess, getAdminOrganisationAccess } = require('../services/organisationAccess')
const {
  getUniversitySurvey,
  getOrCreateTeacherSurvey,
  getProgrammeSurveysByCourseUnit,
} = require('../services/surveys')
const { inProduction, DEV_ADMINS } = require('../util/config')
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
  if (!this.organisationAccess) {
    await this.populateAccess()
  }

  const organisations = await Organisation.findAll({
    where: {
      code: {
        [Op.in]: Object.keys(this.organisationAccess),
      },
    },
    include: {
      model: User,
      as: 'users',
      attributes: ['id', 'firstName', 'lastName', 'email'],
    },
  })

  return organisations.map(org => ({
    access: this.organisationAccess[org.code],
    organisation: org,
  }))
}

User.prototype.populateAccess = async function () {
  // get organisation access and special groups based on IAMs
  const organisationAccess = await getOrganisationAccess(this)

  this.organisationAccess = organisationAccess
  this.specialGroup = organisationAccess.specialGroup
  this.isAdmin = organisationAccess?.specialGroup?.superAdmin

  // Give admin access to configured users in development
  if (!inProduction) {
    this.isAdmin = DEV_ADMINS.includes(this.username)
  }

  if (this.isAdmin) {
    this.organisationAccess = await getAdminOrganisationAccess()
  }
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
