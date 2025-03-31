import {
  Model,
  INTEGER,
  STRING,
  JSONB,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'

/* eslint-disable */
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hash = (s: string): number =>
  Math.abs(
    s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  )
/* eslint-enable */

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<number>
  declare organisationId: string
  declare name: { fi: string; [key: string]: any }
  declare hash: CreationOptional<number>
  declare summary?: any

  getHash = (): number => hash(this.name.fi)
}

Tag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    organisationId: {
      type: STRING,
      references: { model: 'organisations', key: 'id' },
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    hash: {
      type: VIRTUAL,
      get(this: Tag) {
        return this.getHash()
      },
    },
    summary: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { Tag }
