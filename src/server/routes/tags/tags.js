const { Router } = require('express')
const { Op } = require('sequelize')
const { CourseRealisation, Organisation, Tag, CourseRealisationsTag, CourseUnit } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { sequelize } = require('../../db/dbConnection')
const CourseUnitsTag = require('../../models/courseUnitsTag')
const { TAGS_ENABLED } = require('../../util/config')

/**
 * Check whether user has access to organisation with given code
 */
const checkAccess = async (user, code, level = 'read') => {
  const orgAccess = await user.getOrganisationAccess()
  const relevantOrg = orgAccess.find(oac => oac.organisation.code === code)
  if (!relevantOrg || !relevantOrg.access[level]) {
    throw new ApplicationError('You dont have the required rights', 403)
  }
}

/**
 * Get tag ids from body and make sure its an array of integers
 */
const parseTagIds = body => {
  const tagIds = body?.tagIds
  if (!Array.isArray(tagIds)) {
    throw new ApplicationError('Invalid tagIds, must be an array', 400)
  }

  const numberTagIds = tagIds.map(Number)
  if (numberTagIds.some(id => !Number.isInteger(id) || !id)) {
    throw new ApplicationError('tagIds had an invalid element, must be positive integers')
  }

  return numberTagIds
}

/**
 * Set the tags of 1..n course realisations.
 * Given tag ids, course realisation ids and organisation code.
 * Only the tags belonging to the organisation are allowed to be set.
 * Returns the new tag objects which match the given tag ids.
 */
const updateCourseRealisationTags = async (req, res) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  const { courseRealisationIds } = req.body
  if (!courseRealisationIds?.length > 0 || !Array.isArray(courseRealisationIds)) {
    throw new ApplicationError('Invalid courseRealisationIds', 400)
  }

  const courseRealisations = await CourseRealisation.findAll({
    where: {
      id: {
        [Op.in]: courseRealisationIds,
      },
    },
    include: {
      model: Organisation,
      as: 'organisations',
      required: true,
      where: { code },
      include: {
        model: Tag,
        as: 'tags',
        required: true,
      },
    },
  })
  if (courseRealisations.length !== courseRealisationIds.length) {
    throw new ApplicationError('Not found', 404)
  }

  const organisation = courseRealisations[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map(t => t.id)
  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw new ApplicationError('Some of the given tags are not allowed for this cur', 400)
  }

  const newTags = organisation.tags.filter(tag => tagIds.includes(tag.id))

  await sequelize.transaction(async transaction => {
    for (const courseRealisation of courseRealisations) {
      // delete its old tag associations and create new ones. NOTE that we only delete old tags of THIS organisation
      await CourseRealisationsTag.destroy(
        {
          where: {
            tagId: { [Op.in]: availableTagIds },
            courseRealisationId: courseRealisation.id,
          },
        },
        { transaction }
      )

      await CourseRealisationsTag.bulkCreate(
        newTags.map(t => ({
          tagId: t.id,
          courseRealisationId: courseRealisation.id,
        })),
        { transaction }
      )
    }
  })

  return res.send(newTags)
}

/**
 * Set the tags of 1..n course units.
 * Given tag ids, course unit ids and organisation code.
 * Only the tags belonging to the organisation are allowed to be set.
 * Returns the new tag objects which match the given tag ids.
 */
const updateCourseUnitTags = async (req, res) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  const { courseCode } = req.body
  if (!courseCode) {
    throw new ApplicationError('Invalid courseCode', 400)
  }

  const courseUnits = await CourseUnit.findAll({
    where: { courseCode },
    include: { model: Organisation, as: 'organisations', where: { code }, include: { model: Tag, as: 'tags' } },
  })
  if (courseUnits.length === 0) {
    ApplicationError.NotFound()
  }

  const organisation = courseUnits[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map(t => t.id)

  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw new ApplicationError('Some of the given tags are not allowed for this cur', 400)
  }

  const newTags = organisation.tags.filter(tag => tagIds.includes(tag.id))

  await sequelize.transaction(async transaction => {
    // delete its old tag associations and create new ones. NOTE that we only delete old tags of THIS organisation
    await CourseUnitsTag.destroy(
      {
        where: {
          tagId: { [Op.in]: availableTagIds },
          courseCode,
        },
      },
      { transaction }
    )

    await CourseUnitsTag.bulkCreate(
      newTags.map(t => ({
        tagId: t.id,
        courseCode,
      })),
      { transaction }
    )
  })

  return res.send(newTags)
}

/**
 * Get all tags belonging to an organisation.
 * User must have organisation access.
 */
const getTags = async (req, res) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  if (!TAGS_ENABLED.includes(code)) throw new ApplicationError('Invalid organisation code', 400)

  const { id: organisationId } = await Organisation.findOne({
    where: {
      code,
    },
    attributes: ['id'],
  })

  if (!organisationId) throw new ApplicationError('Organisation not found', 404)

  const tags = await Tag.findAll({
    where: {
      organisationId,
    },
  })

  return res.send(tags)
}

const router = Router()

router.put('/:organisationCode/course-realisations', updateCourseRealisationTags)
router.put('/:organisationCode/course-units', updateCourseUnitTags)
router.get('/:organisationCode', getTags)

module.exports = router
