import { Router, Response } from 'express'
import { Op, Transaction } from 'sequelize'
import { AuthenticatedRequest } from 'types'
import { CourseRealisation, Organisation, Tag, CourseRealisationsTag, CourseUnit } from '../../models'
import { CourseUnitsTag } from '../../models/courseUnitsTag'
import { ApplicationError } from '../../util/customErrors'
import { sequelize } from '../../db/dbConnection'
import { TAGS_ENABLED } from '../../util/config'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'

/**
 * Check whether user has access to organisation with given code
 */
const checkAccess = async (user: any, code: string, level = 'read'): Promise<void> => {
  const orgAccess = await getUserOrganisationAccess(user)
  const relevantOrg = orgAccess.find((oac: any) => oac.organisation.code === code)
  if (!relevantOrg || !relevantOrg.access[level]) {
    throw new ApplicationError('You dont have the required rights', 403)
  }
}

/**
 * Get tag ids from body and make sure its an array of integers
 */
const parseTagIds = (body: any): number[] => {
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
const updateCourseRealisationTags = async (req: AuthenticatedRequest, res: Response) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  const { courseRealisationIds } = req.body
  if (!courseRealisationIds?.length || !Array.isArray(courseRealisationIds)) {
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
      include: [
        {
          model: Tag,
          as: 'tags',
          required: true,
        },
      ],
    },
  })
  if (courseRealisations.length !== courseRealisationIds.length) {
    throw new ApplicationError('Not found', 404)
  }

  const organisation = courseRealisations[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map((t: any) => t.id)
  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw new ApplicationError('Some of the given tags are not allowed for this cur', 400)
  }

  const newTags = organisation.tags.filter((tag: any) => tagIds.includes(tag.id))

  await sequelize.transaction(async (transaction: Transaction) => {
    for (const courseRealisation of courseRealisations) {
      // delete its old tag associations and create new ones. NOTE that we only delete old tags of THIS organisation
      await CourseRealisationsTag.destroy({
        where: {
          tagId: { [Op.in]: availableTagIds },
          courseRealisationId: courseRealisation.id,
        },
        transaction,
      })

      await CourseRealisationsTag.bulkCreate(
        newTags.map((t: any) => ({
          tagId: t.id,
          courseRealisationId: courseRealisation.id,
        })),
        { transaction }
      )
    }
  })

  res.send(newTags)
}

/**
 * Set the tags of 1..n course units.
 * Given tag ids, course unit ids and organisation code.
 * Only the tags belonging to the organisation are allowed to be set.
 * Returns the new tag objects which match the given tag ids.
 */
const updateCourseUnitTags = async (req: AuthenticatedRequest, res: Response) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  const { courseCode } = req.body
  if (!courseCode) {
    throw new ApplicationError('Invalid courseCode', 400)
  }

  const courseUnits = await CourseUnit.findAll({
    where: { courseCode },
    include: { model: Organisation, as: 'organisations', where: { code }, include: [{ model: Tag, as: 'tags' }] },
  })
  if (courseUnits.length === 0) {
    ApplicationError.NotFound()
  }

  const organisation = courseUnits[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map((t: any) => t.id)

  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw new ApplicationError('Some of the given tags are not allowed for this cur', 400)
  }

  const newTags = organisation.tags.filter((tag: any) => tagIds.includes(tag.id))

  await sequelize.transaction(async (transaction: Transaction) => {
    // delete its old tag associations and create new ones. NOTE that we only delete old tags of THIS organisation
    await CourseUnitsTag.destroy({
      where: {
        tagId: { [Op.in]: availableTagIds },
        courseCode,
      },
      transaction,
    })

    await CourseUnitsTag.bulkCreate(
      newTags.map((t: any) => ({
        tagId: t.id,
        courseCode,
      })),
      { transaction }
    )
  })

  res.send(newTags)
}

/**
 * Get all tags belonging to an organisation.
 * User must have organisation access.
 */
const getTags = async (req: AuthenticatedRequest, res: Response) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  if (!TAGS_ENABLED.includes(code)) throw new ApplicationError('Invalid organisation code', 400)

  const org = await Organisation.findOne({
    where: { code },
    attributes: ['id'],
  })

  const organisationId = org?.id
  if (!organisationId) throw new ApplicationError('Organisation not found', 404)

  const tags = await Tag.findAll({
    where: {
      organisationId,
    },
  })

  res.send(tags)
}

const router = Router()

router.put('/:organisationCode/course-realisations', updateCourseRealisationTags)
router.put('/:organisationCode/course-units', updateCourseUnitTags)
router.get('/:organisationCode', getTags)

export { router }
