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
const { Organisation } = require('./organisation')
const { User } = require('./user')
const { populateUserAccess } = require('../services/organisationAccess/organisationAccess')

/**
 * Gets, somewhat confusingly, the organisations user has access to, along the corresponding access objects.
 *
 * Should not be confused with the user's organisationAccess field, which is a map of organisation codes to access objects.
 * @returns {Promise<{ access: object, organisation: Organisation }[]>}
 */
User.prototype.getOrganisationAccess = async function () {
  await populateUserAccess(this)
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
