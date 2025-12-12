import { Router, Response } from 'express'
import { Op, Transaction } from 'sequelize'
import { AuthenticatedRequest } from 'types'
import { OrganisationAccess } from '@common/types/organisation'
import { CourseRealisation, Organisation, Tag, CourseRealisationsTag, CourseUnit } from '../../models'
import { CourseUnitsTag } from '../../models/courseUnitsTag'
import { ApplicationError } from '../../util/ApplicationError'
import { sequelize } from '../../db/dbConnection'
import { TAGS_ENABLED } from '../../util/config'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'

/**
 * Check whether user has access to organisation with given code
 */
const checkAccess = async (user: any, code: string, level: keyof OrganisationAccess = 'read'): Promise<void> => {
  const orgAccess = await getUserOrganisationAccess(user)
  const relevantOrg = orgAccess.find((oac: any) => oac.organisation.code === code)
  if (!relevantOrg || !relevantOrg.access[level]) {
    throw ApplicationError.Forbidden('You dont have the required rights')
  }
}

/**
 * Get tag ids from body and make sure its an array of integers
 */
const parseTagIds = (body: any): number[] => {
  const tagIds = body?.tagIds
  if (!Array.isArray(tagIds)) {
    throw ApplicationError.BadRequest('Invalid tagIds, must be an array')
  }

  const numberTagIds = tagIds.map(Number)
  if (numberTagIds.some(id => !Number.isInteger(id) || !id)) {
    throw ApplicationError.BadRequest('tagIds had an invalid element, must be positive integers')
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
    throw ApplicationError.BadRequest('Invalid courseRealisationIds')
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
    throw ApplicationError.NotFound()
  }

  const organisation = courseRealisations[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map((t: any) => t.id)
  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw ApplicationError.BadRequest('Some of the given tags are not allowed for this cur')
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
    throw ApplicationError.BadRequest('Invalid courseCode')
  }

  const courseUnits = await CourseUnit.findAll({
    where: { courseCode },
    include: { model: Organisation, as: 'organisations', where: { code }, include: [{ model: Tag, as: 'tags' }] },
  })
  if (courseUnits.length === 0) {
    throw ApplicationError.NotFound()
  }

  const organisation = courseUnits[0].organisations[0] // there can be only one, becoz code in the where param
  const availableTagIds = organisation.tags.map((t: any) => t.id)

  const tagIds = parseTagIds(req.body)
  if (tagIds.some(id => !availableTagIds.includes(id))) {
    throw ApplicationError.BadRequest('Some of the given tags are not allowed for this cur')
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

  if (!TAGS_ENABLED.includes(code)) throw ApplicationError.BadRequest('Invalid organisation code')

  const org = await Organisation.findOne({
    where: { code },
    attributes: ['id'],
  })

  const organisationId = org?.id
  if (!organisationId) throw ApplicationError.NotFound('Organisation not found')

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
