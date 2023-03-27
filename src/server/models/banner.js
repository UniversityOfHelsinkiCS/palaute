const { ENUM, DATE, Op } = require('sequelize')
const { Model, JSONB } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class Banner extends Model {
  static async getForUser(user) {
    let access = ['STUDENT']

    const isTeacher = await user.isTeacher()
    const hasOrgAccess = (await user.getOrganisationAccess())?.length > 0

    if (user.isAdmin) {
      access = access.concat(['TEACHER', 'ORG', 'ADMIN'])
    } else if (hasOrgAccess) {
      access = access.concat(['TEACHER', 'ORG'])
    } else if (isTeacher) {
      access = access.concat(['TEACHER'])
    }

    const banners = await Banner.findAll({
      where: {
        accessGroup: {
          [Op.in]: access,
        },
        startDate: {
          [Op.lt]: new Date(),
        },
        endDate: {
          [Op.gt]: new Date(),
        },
      },
    })

    return banners
  }
}

Banner.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    accessGroup: {
      type: ENUM,
      values: ['STUDENT', 'TEACHER', 'ORG', 'ADMIN'],
    },
    startDate: {
      type: DATE,
      allowNull: false,
    },
    endDate: {
      type: DATE,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
  }
)

module.exports = Banner
