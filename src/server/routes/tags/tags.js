const { Router } = require('express')
const { Op } = require('sequelize')
const {
  CourseRealisation,
  Organisation,
  Tag,
  CourseRealisationsTag,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { sequelize } = require('../../util/dbConnection')

const checkAccess = async (user, code) => {
  const orgAccess = await user.getOrganisationAccess()
  if (!orgAccess.find((oac) => oac.organisation.code === code)?.access?.write) {
    throw new ApplicationError('You dont have the required rights', 403)
  }
}

const parseTagIds = (body) => {
  const tagIds = body?.tagIds
  if (!Array.isArray(tagIds)) {
    throw new ApplicationError('Invalid tagIds, must be an array', 400)
  }

  const numberTagIds = tagIds.map(Number)
  if (numberTagIds.some((id) => !Number.isInteger(id) || !id)) {
    throw new ApplicationError(
      'tagIds had an invalid element, must be positive integers',
    )
  }

  return numberTagIds
}

const updateCourseRealisationTags = async (req, res) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  const { courseRealisationIds } = req.body
  if (
    !courseRealisationIds?.length > 0 ||
    !Array.isArray(courseRealisationIds)
  ) {
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
  const availableTagIds = organisation.tags.map((t) => t.id)
  const tagIds = parseTagIds(req.body)
  if (tagIds.some((id) => !availableTagIds.includes(id))) {
    throw new ApplicationError(
      'Some of the given tags are not allowed for this cur',
      400,
    )
  }

  const newTags = organisation.tags.filter((tag) => tagIds.includes(tag.id))

  await sequelize.transaction(async (transaction) => {
    for (const courseRealisation of courseRealisations) {
      // delete its old tag associations and create new ones. NOTE that we only delete old tags of THIS organisation
      await CourseRealisationsTag.destroy(
        {
          where: {
            tagId: { [Op.in]: availableTagIds },
            courseRealisationId: courseRealisation.id,
          },
        },
        { transaction },
      )

      await CourseRealisationsTag.bulkCreate(
        newTags.map((t) => ({
          tagId: t.id,
          courseRealisationId: courseRealisation.id,
        })),
        { transaction },
      )
    }
  })

  return res.send(newTags)
}

const getTags = async (req, res) => {
  const { organisationCode: code } = req.params
  await checkAccess(req.user, code)

  if (code !== '600-K001')
    throw new ApplicationError('Invalid organisation code', 400)

  const tags = await Tag.findAll()

  return res.send(tags)
}

const router = Router()

router.put(
  '/:organisationCode/course-realisations',
  updateCourseRealisationTags,
)
router.get('/:organisationCode', getTags)

module.exports = router
