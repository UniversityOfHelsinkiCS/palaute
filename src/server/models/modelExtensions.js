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

FeedbackTarget.prototype.getSurveys = async function () {
  const [programmeSurveys, teacherSurvey, universitySurvey] = await Promise.all([
    getProgrammeSurveysByCourseUnit(this.courseUnitId),
    getOrCreateTeacherSurvey(this),
    getUniversitySurvey(),
  ])

  if (this.userCreated) {
    universitySurvey.questionIds = []
    universitySurvey.questions = []

    return {
      programmeSurveys: [],
      teacherSurvey,
      universitySurvey,
    }
  }

  return {
    programmeSurveys,
    teacherSurvey,
    universitySurvey,
  }
}

/**
 * Gets, somewhat confusingly, the organisations user has access to, along the corresponding access objects.
 *
 * Should not be confused with the user's organisationAccess field, which is a map of organisation codes to access objects.
 * @returns {Promise<{ access: object, organisation: Organisation }[]>}
 */
User.prototype.getOrganisationAccess = async function () {
  await this.populateAccess()
  let { accessibleOrganisations } = this

  if (!accessibleOrganisations) {
    accessibleOrganisations = await Organisation.findAll({
      attributes: ['id', 'name', 'code', 'parentId'],
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
  }

  return accessibleOrganisations.map(org => ({
    access: this.organisationAccess[org.code],
    organisation: org,
  }))
}

/**
 * Populates the user's organisationAccess, specialGroup and isAdmin fields.
 */
User.prototype.populateAccess = async function () {
  if (this.organisationAccess) return

  // get organisation access and special groups based on IAMs
  const organisationAccess = await getOrganisationAccess(this)

  this.organisationAccess = organisationAccess
  this.specialGroup = organisationAccess.specialGroup ?? {}
  this.isAdmin = this.specialGroup.superAdmin
  this.isEmployee = this.specialGroup.employee

  // remove specialGroup from organisationAccess. Its confusing to have it there, other keys are organisation codes.
  delete this.organisationAccess.specialGroup

  // Give admin access to configured users in development
  if (!inProduction) {
    this.isAdmin = DEV_ADMINS.includes(this.username)
  }

  if (this.isAdmin) {
    this.organisationAccess = await getAdminOrganisationAccess()
  }
}
