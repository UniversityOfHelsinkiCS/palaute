import { Model, JSONB, ENUM, DATE, Op } from 'sequelize'
import { sequelize } from '../db/dbConnection'
import type { User } from './user'

class Banner extends Model {
  declare data: object
  declare accessGroup: 'STUDENT' | 'TEACHER' | 'ORG' | 'ADMIN'
  declare startDate: Date
  declare endDate: Date

  static getForUser = async (user: User): Promise<Banner[]> => {
    let access: string[] = ['STUDENT']

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
      type: ENUM('STUDENT', 'TEACHER', 'ORG', 'ADMIN'),
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

export { Banner }
