const { Model, STRING, Op } = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../util/dbConnection')
const lomakeClient = require('../util/lomakeClient')
const Organisation = require('./organisation')
const { ADMINS } = require('../../config')

const isNumber = (value) => !Number.isNaN(parseInt(value, 10))

const normalizeOrganisationCode = (r) => {
  const [left, right] = r.split('_')
  const prefix = [...left].filter(isNumber).join('')
  const suffix = `${left[0]}${right}`
  const providercode = `${prefix}0-${suffix}`
  return providercode
}

class User extends Model {
  async getOrganisationAccess() {
    if (ADMINS.includes(this.username)) {
      const allOrganisations = await Organisation.findAll({})
      return allOrganisations.map((organisation) => ({
        organisation,
        access: { read: true, write: true },
      }))
    }
    const { data: access } = await lomakeClient.get(
      `/organizations/${this.username}`,
    )

    const organisationCodes = _.isObject(access) ? Object.keys(access) : []

    const normalizedOrganisationCodes = organisationCodes.map(
      normalizeOrganisationCode,
    )

    const codeByNormalizedCode = _.zipObject(
      normalizedOrganisationCodes,
      organisationCodes,
    )

    if (normalizedOrganisationCodes.length === 0) {
      return []
    }

    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: normalizedOrganisationCodes,
        },
      },
    })
    return organisations.map((organisation) => ({
      organisation,
      access: access[codeByNormalizedCode[organisation.code]],
    }))
  }
}

User.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: STRING,
      allowNull: false,
    },
    firstName: {
      type: STRING,
    },
    lastName: {
      type: STRING,
    },
    email: {
      type: STRING,
    },
    language: {
      type: STRING,
    },
    studentNumber: {
      type: STRING,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = User
