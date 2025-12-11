import { Op } from 'sequelize'
import { SUMMARY_EXCLUDED_ORG_IDS } from '../../util/config'
import { getSummaryAccessibleOrganisationIds } from './access'
import { Organisation, User } from '../../models'
import { sumSummaries, getScopedSummary } from './utils'
import { ApplicationError } from '../../util/ApplicationError'

interface GetUserOrganisationSummariesParams {
  startDate: string
  endDate: string
  user: User
  viewingMode?: 'flat' | 'tree'
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

export const getUserOrganisationSummaries = async ({
  startDate,
  endDate,
  user,
  viewingMode = 'flat',
  extraOrgId,
  extraOrgMode,
}: GetUserOrganisationSummariesParams) => {
  const organisationIds = await getSummaryAccessibleOrganisationIds(user)
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code', 'parentId'],
    where: {
      id: {
        [Op.in]: organisationIds,
        [Op.notIn]: SUMMARY_EXCLUDED_ORG_IDS,
      },
    },
    include: {
      model: scopedSummary,
      as: 'summaries',
      required: false,
    },
    order: [['code', 'ASC']],
  })

  const organisationsJson = organisations.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries
    return org.toJSON()
  })

  if (viewingMode === 'flat') {
    return organisationsJson
  }

  if (viewingMode === 'tree') {
    const rootOrganisations = []
    for (const org of organisationsJson) {
      const parentOrg = organisationsJson.find(o => o.id === org.parentId) as (typeof organisationsJson)[0] & {
        initiallyExpanded?: boolean
      }
      if (!parentOrg) {
        rootOrganisations.push(org)
      } else {
        if (!parentOrg.childOrganisations) {
          parentOrg.childOrganisations = []
        }
        parentOrg.childOrganisations.push(org as any)
        parentOrg.initiallyExpanded = true
      }
    }

    return rootOrganisations
  }

  return ApplicationError.BadRequest(`Invalid viewing mode ${viewingMode}`)
}
