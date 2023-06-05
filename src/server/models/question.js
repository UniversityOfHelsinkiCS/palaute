const { Model, JSONB, STRING, BOOLEAN } = require('sequelize')
const { sequelize } = require('../db/dbConnection')
const { WORKLOAD_QUESTION_ID } = require('../util/config')

class Question extends Model {}

Question.init(
  {
    type: {
      type: STRING,
      allowNull: false,
    },
    secondaryType: {
      type: STRING,
      allowNull: true,
      get() {
        const secondaryTypeValue = this.getDataValue('secondaryType') ?? 'OTHER'
        return this.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : secondaryTypeValue
      },
    },
    required: {
      type: BOOLEAN,
      allowNull: false,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Question
