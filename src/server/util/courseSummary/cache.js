/* eslint-disable camelcase, no-console */
/* eslint-disable prefer-destructuring */

const _ = require('lodash')
const { Op } = require('sequelize')

const { FeedbackSummaryCache } = require('../../models')

const serialize = (rows) => {
  console.time('serialize')
  const groupedRows = _.groupBy(
    rows,
    (row) => `${row.course_realisation_id}#${row.organisation_id}`,
  )
  const cacheRows = Object.entries(groupedRows).map(([key, value]) => {
    const [course_realisation_id, organisation_id] = key.split('#')

    // Small json keys are less data. If it works it aint stupid (sometimes).
    const json = {
      sc: value[0].student_count,
      fc: value[0].feedback_count,
      fi: value[0].feedback_target_id,
      ca: value[0].closes_at,
      cc: value[0].course_code,
      cn: value[0].course_unit_name,
      ci: value[0].course_unit_id,
      fg: value[0].feedback_response_given,
      d: value.map((v) => ({
        qi: v.question_id,
        qd: v.question_data,
        qc: v.question_data_count,
      })),
    }

    return {
      course_realisation_id,
      organisation_id,
      course_realisation_start_date: new Date(
        value[0].course_realisation_start_date,
      ),
      data: json,
    }
  })

  console.timeEnd('serialize')

  return cacheRows
}

const deserialize = (cacheData) => {
  console.time('deserialize')
  const rows = []
  for (let i = 0; i < cacheData.length; i++) {
    const cacheRow = cacheData[i]
    const data = cacheRow.data
    for (let j = 0; j < data.d.length; j++) {
      const answer = data.d[j]
      rows.push({
        student_count: data.sc,
        feedback_count: data.fc,
        feedback_target_id: data.fi,
        closes_at: data.ca,
        course_realisation_id: cacheRow.course_realisation_id,
        course_realisation_start_date: cacheRow.course_realisation_start_date,
        course_code: data.cc,
        course_unit_name: data.cn,
        course_unit_id: data.ci,
        organisation_id: cacheRow.organisation_id,
        feedback_response_given: data.fg,
        question_id: answer.qi,
        question_data: answer.qd,
        question_data_count: answer.qc,
      })
    }
  }

  console.timeEnd('deserialize')
  return rows
}

const cacheSummary = async (rows) => {
  await FeedbackSummaryCache.destroy({ where: {} })
  await FeedbackSummaryCache.bulkCreate(serialize(rows))
}

const getSummaryFromCache = async (
  organisationIds,
  courseRealisationIds,
  startDate,
  endDate,
) => {
  console.time('-getSummaryFromCache')
  const cacheRows = await FeedbackSummaryCache.findAll({
    where: {
      [Op.or]: {
        organisation_id: {
          [Op.in]: organisationIds,
        },
        course_realisation_id: {
          [Op.in]: courseRealisationIds,
        },
      },
      course_realisation_start_date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['course_realisation_id', 'asc']], // partitionOpenUniRows benefits from this 100ms
  })

  const result = deserialize(cacheRows)

  console.timeEnd('-getSummaryFromCache')
  return result
}

module.exports = {
  cacheSummary,
  getSummaryFromCache,
}
