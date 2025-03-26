import * as Sentry from '@sentry/node'
import { Op } from 'sequelize'
import { sequelize } from '../../db/dbConnection'
import { Organisation, OrganisationFeedbackCorrespondent, User } from '../../models'
import { normalizeOrganisationCode } from '../../util/common'
import { logger } from '../../util/logger'
import { FEEDBACK_CORRESPONDENT_SPECIAL_GROUP } from '../../util/config'

export const updateFeedbackCorrespondent = async (user: User): Promise<void> => {
  // Update feedback correspondents of user
  const feedbackCorrespondentSpecialGroup: string[] | undefined =
    user.specialGroup[FEEDBACK_CORRESPONDENT_SPECIAL_GROUP]

  const programmeKeys = Array.isArray(feedbackCorrespondentSpecialGroup) ? feedbackCorrespondentSpecialGroup : []
  const organisationCodes = programmeKeys.map(normalizeOrganisationCode)
  const organisations = await Organisation.findAll({
    where: {
      code: organisationCodes,
    },
  })

  if (organisations.length !== organisationCodes.length) {
    const msg = `Warning: could not find all organisations with these codes: ${organisationCodes}`
    logger.error(msg)
    Sentry.captureMessage(msg)
  }

  await sequelize.transaction(async () => {
    if (organisations.length > 0) {
      for (const org of organisations) {
        const [, created] = await OrganisationFeedbackCorrespondent.findOrCreate({
          where: {
            userId: user.id,
            organisationId: org.id,
          },
          defaults: {
            userCreated: false,
          },
        })

        // If created, log it
        if (created) {
          logger.info(`User ${user.id} automatically added as feedback correspondent for ${org.code}`)
        }
      }
    }

    // Delete other automatically created feedback correspondents
    const deleted = await OrganisationFeedbackCorrespondent.destroy({
      where: {
        userId: user.id,
        userCreated: false,
        organisationId: {
          [Op.notIn]: organisations.map(org => org.id),
        },
      },
    })

    // If deleted, log it
    if (deleted) {
      logger.info(`Deleted ${deleted} automatically created feedback correspondents of ${user.id}`)
    }
  })
}
