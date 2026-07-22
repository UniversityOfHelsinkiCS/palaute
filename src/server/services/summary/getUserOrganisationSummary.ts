import { Op } from 'sequelize'
import { SUMMARY_EXCLUDED_ORG_IDS } from '../../util/config'
import { getSummaryAccessibleOrganisationIds } from './access'
import { Organisation, User } from '../../models'
import { sumSummaries, getScopedSummary } from './utils'

type GetUserOrganisationSummariesParams = {
  startDate: string
  endDate: string
  user: User
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude' | 'only'
}

export const getUserOrganisationSummaries = async ({
  startDate,
  endDate,
  user,
  extraOrgId,
  extraOrgMode,
}: GetUserOrganisationSummariesParams) => {
  const [accessibleOrgIds, allOrgs] = await Promise.all([
    getSummaryAccessibleOrganisationIds(user),
    Organisation.findAll({ attributes: ['id', 'parentId'] }),
  ])

  const excludedIds = new Set(SUMMARY_EXCLUDED_ORG_IDS)
  const accessibleNonExcludedIds = new Set(accessibleOrgIds.filter(id => !excludedIds.has(id)))
  const parentMap = new Map(allOrgs.map(o => [o.id, o.dataValues.parentId]))

  const hasAccessibleAncestor = (id: string): boolean => {
    let currentId = parentMap.get(id)
    while (currentId) {
      if (accessibleNonExcludedIds.has(currentId)) return true
      currentId = parentMap.get(currentId) ?? null
    }
    return false
  }

  const rootOrgIds = [...accessibleNonExcludedIds].filter(id => !hasAccessibleAncestor(id))
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const rootOrgs = await Organisation.findAll({
    attributes: ['id', 'name', 'code', 'parentId'],
    where: {
      id: { [Op.in]: rootOrgIds },
    },
    include: {
      model: scopedSummary,
      as: 'summaries',
      required: false,
    },
    order: [['code', 'ASC']],
  })

  return rootOrgs.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries
    return org.toJSON()
  })
}
