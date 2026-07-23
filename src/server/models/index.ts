import { Banner } from './banner'
import { ContinuousFeedback } from './continuousFeedback'
import { CourseRealisation } from './courseRealisation'
import { CourseRealisationsOrganisation } from './courseRealisationsOrganisation'
import { CourseRealisationsTag } from './courseRealisationsTag'
import { CourseUnit } from './courseUnit'
import { CourseUnitsOrganisation } from './courseUnitsOrganisation'
import { CourseUnitsTag } from './courseUnitsTag'
import Feedback from './feedback'
import { FeedbackTarget } from './feedbackTarget'
import { FeedbackTargetLog } from './feedbackTargetLog'
import { Group } from './group'
import { InactiveCourseRealisation } from './inactiveCourseRealisation'
import { NorppaFeedback } from './norppaFeedback'
import { Organisation } from './organisation'
import { OrganisationFeedbackCorrespondent } from './organisationFeedbackCorrespondent'
import { OrganisationLog } from './organisationLog'
import OrganisationSurveyCourse from './organisationSurveyCourse'
import { Question } from './question'
import Summary from './summary'
import { Survey } from './survey'
import { Tag } from './tag'
import { UpdaterStatus } from './updaterStatus'
import { User } from './user'
import { UserFeedbackTarget } from './userFeedbackTarget'
import { UserOrganisationPin } from './userOrganisationPin'

FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
})
CourseUnit.hasMany(FeedbackTarget, {
  as: 'feedbackTargets',
})

FeedbackTarget.belongsTo(CourseRealisation, {
  foreignKey: 'courseRealisationId',
  as: 'courseRealisation',
})
CourseRealisation.hasMany(FeedbackTarget, {
  foreignKey: 'courseRealisationId',
  as: 'feedbackTargets',
})

UserFeedbackTarget.belongsTo(FeedbackTarget, { as: 'feedbackTarget' })
FeedbackTarget.hasMany(UserFeedbackTarget, { as: 'userFeedbackTargets' })
FeedbackTarget.hasMany(UserFeedbackTarget, { as: 'students' })

UserFeedbackTarget.belongsTo(Feedback, {
  as: 'feedback',
  foreignKey: 'feedbackId',
})

Feedback.hasOne(UserFeedbackTarget, {
  as: 'userFeedbackTarget',
  foreignKey: 'feedbackId',
})

UserFeedbackTarget.belongsTo(User, {
  as: 'user',
})

User.hasMany(UserFeedbackTarget, { as: 'userFeedbackTargets' })

Survey.belongsTo(CourseUnit, {
  as: 'courseUnit',
  foreignKey: 'typeId',
  targetKey: 'courseCode',
})

Survey.belongsTo(Organisation, {
  as: 'organisation',
  foreignKey: 'typeId',
  targetKey: 'code',
})

Organisation.hasMany(Survey, {
  as: 'surveys',
  foreignKey: 'typeId',
  sourceKey: 'code',
})

CourseUnit.belongsToMany(Organisation, {
  through: CourseUnitsOrganisation,
  as: 'organisations',
})

CourseUnit.hasMany(CourseUnitsOrganisation, {
  as: 'courseUnitsOrganisations',
})

Organisation.belongsToMany(CourseUnit, {
  through: CourseUnitsOrganisation,
  as: 'courseUnits',
})

Organisation.hasMany(CourseUnitsOrganisation, {
  as: 'courseUnitsOrganisations',
})

CourseRealisation.belongsToMany(Organisation, {
  through: CourseRealisationsOrganisation,
  as: 'organisations',
})

CourseRealisation.hasMany(CourseRealisationsOrganisation, {
  as: 'courseRealisationsOrganisations',
})

Organisation.belongsToMany(CourseRealisation, {
  through: CourseRealisationsOrganisation,
  as: 'courseRealisations',
})

Organisation.hasMany(CourseRealisationsOrganisation, {
  as: 'courseRealisationsOrganisations',
})

Organisation.belongsTo(Organisation, {
  foreignKey: 'parent_id',
  as: 'parentOrganisation',
})

Organisation.hasMany(Organisation, {
  foreignKey: 'parent_id',
  as: 'childOrganisations',
})

FeedbackTarget.belongsToMany(User, {
  through: UserFeedbackTarget,
  as: 'users',
  foreignKey: 'feedback_target_id',
})

User.belongsToMany(FeedbackTarget, {
  through: UserFeedbackTarget,
  as: 'feedback_targets',
  foreignKey: 'user_id',
})

NorppaFeedback.belongsTo(User, {
  as: 'user',
})

OrganisationLog.belongsTo(Organisation, {
  as: 'organisation',
  foreignKey: 'organisation_id',
})

OrganisationLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
})

User.hasMany(OrganisationLog, { as: 'organisationLogs' })

Organisation.hasMany(OrganisationLog, { as: 'organisationLogs' })

FeedbackTargetLog.belongsTo(FeedbackTarget, {
  as: 'feedback_target',
  foreignKey: 'feedback_target_id',
})

FeedbackTargetLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
})

User.hasMany(FeedbackTargetLog, { as: 'feedbackTargetLogs' })

FeedbackTarget.hasMany(FeedbackTargetLog, { as: 'feedbackTargetLogs' })

ContinuousFeedback.belongsTo(FeedbackTarget, {
  as: 'feedbackTarget',
  foreignKey: 'feedback_target_id',
})

ContinuousFeedback.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
})

User.hasMany(ContinuousFeedback, { as: 'continuousFeedbacks' })

FeedbackTarget.hasMany(ContinuousFeedback, { as: 'continuousFeedbacks' })

Organisation.belongsToMany(User, {
  through: OrganisationFeedbackCorrespondent,
  as: 'users',
  foreignKey: 'organisation_id',
})
User.belongsToMany(Organisation, {
  through: OrganisationFeedbackCorrespondent,
  as: 'organisations',
  foreignKey: 'user_id',
})
Organisation.hasMany(OrganisationFeedbackCorrespondent)
OrganisationFeedbackCorrespondent.belongsTo(Organisation)

User.belongsToMany(Organisation, {
  through: UserOrganisationPin,
  as: 'pinnedOrganisations',
  foreignKey: 'user_id',
})
Organisation.belongsToMany(User, {
  through: UserOrganisationPin,
  as: 'pinnedByUsers',
  foreignKey: 'organisation_id',
})
User.hasMany(UserOrganisationPin)
UserOrganisationPin.belongsTo(User)
Organisation.hasMany(UserOrganisationPin)
UserOrganisationPin.belongsTo(Organisation)

Organisation.hasMany(Tag, { as: 'tags' })
Tag.belongsTo(Organisation, { as: 'organisation' })

CourseRealisation.belongsToMany(Tag, {
  through: CourseRealisationsTag,
  as: 'tags',
})
Tag.belongsToMany(CourseRealisation, {
  through: CourseRealisationsTag,
  as: 'courseRealisations',
})
Tag.hasMany(CourseRealisationsTag, { as: 'courseRealisationsTags' })
CourseRealisationsTag.belongsTo(Tag, { as: 'tag' })
CourseRealisation.hasMany(CourseRealisationsTag, { as: 'courseRealisationsTags' })
CourseRealisationsTag.belongsTo(CourseRealisation, { as: 'courseRealisation' })

// Slightly fakd association here, as courseCode on CourseUnit is not unique constrained.
// It works somewhat, but custom queries may sometimes be needed
CourseUnit.belongsToMany(Tag, {
  through: CourseUnitsTag,
  sourceKey: 'courseCode',
  foreignKey: 'courseCode',
  as: 'tags',
})
CourseUnit.hasMany(CourseUnitsTag, { as: 'courseUnitsTags', sourceKey: 'courseCode', foreignKey: 'courseCode' })
Tag.hasMany(CourseUnitsTag, { as: 'courseUnitsTags' })
CourseUnitsTag.belongsTo(Tag, { as: 'tag' })

/**
 * Groups associations
 */

FeedbackTarget.hasMany(Group, {
  foreignKey: 'feedbackTargetId',
  as: 'groups',
})
Group.belongsTo(FeedbackTarget, {
  foreignKey: 'feedbackTargetId',
  as: 'feedbackTarget',
})

/**
 * Summary associations
 */
Summary.belongsTo(Organisation, { foreignKey: 'entityId', as: 'organisation' })
Organisation.hasMany(Summary, { foreignKey: 'entityId', as: 'summaries' })

Summary.belongsTo(CourseUnit, { foreignKey: 'entityId', as: 'courseUnit' })
CourseUnit.hasMany(Summary, { foreignKey: 'entityId', as: 'summaries' })

Summary.belongsTo(CourseUnit, { targetKey: 'groupId', foreignKey: 'entityId', as: 'groupCourseUnit' })
CourseUnit.hasMany(Summary, { sourceKey: 'groupId', foreignKey: 'entityId', as: 'groupSummaries' })

Summary.belongsTo(FeedbackTarget, { foreignKey: 'feedbackTargetId', as: 'feedbackTarget' })
FeedbackTarget.hasOne(Summary, { foreignKey: 'feedbackTargetId', as: 'summary' })
FeedbackTarget.hasMany(Summary, { foreignKey: 'feedbackTargetId', as: 'summaries' })

Summary.belongsTo(CourseRealisation, { foreignKey: 'entityId', as: 'courseRealisation' })
CourseRealisation.hasOne(Summary, { foreignKey: 'entityId', as: 'summary' })

export {
  Feedback,
  User,
  CourseRealisation,
  FeedbackTarget,
  Survey,
  CourseUnit,
  UserFeedbackTarget,
  Question,
  Organisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  NorppaFeedback,
  UpdaterStatus,
  OrganisationLog,
  FeedbackTargetLog,
  ContinuousFeedback,
  OrganisationFeedbackCorrespondent,
  UserOrganisationPin,
  CourseRealisationsTag,
  InactiveCourseRealisation,
  Banner,
  Tag,
  CourseUnitsTag,
  Group,
  Summary,
  OrganisationSurveyCourse,
}
