const { Model, STRING, Op } = require('sequelize')
const _ = require('lodash')

const { sequelize } = require('../util/dbConnection')
const lomakeClient = require('../util/lomakeClient')
const Organisation = require('./organisation')

class User extends Model {
  async getOrganisationAccess() {
    const { data: access } = await lomakeClient.get(
      `/organizations/${this.username}`,
    )

    const organisationCodes = _.isObject(access) ? Object.keys(access) : []

    if (organisationCodes.length === 0) {
      return []
    }

    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: organisationCodes,
        },
      },
    })

    return organisations.map((organisation) => ({
      organisation,
      access: access[organisation.code],
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
