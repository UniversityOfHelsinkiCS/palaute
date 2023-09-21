const Feedback = require('./feedback')
const User = require('./user')
const CourseRealisation = require('./courseRealisation')
const FeedbackTarget = require('./feedbackTarget')
const Question = require('./question')
const Survey = require('./survey')
const CourseUnit = require('./courseUnit')
const UserFeedbackTarget = require('./userFeedbackTarget')
const Organisation = require('./organisation')
const CourseUnitsOrganisation = require('./courseUnitsOrganisation')
const CourseRealisationsOrganisation = require('./courseRealisationsOrganisation')
const NorppaFeedback = require('./norppaFeedback')
const UpdaterStatus = require('./updaterStatus')
const OrganisationLog = require('./organisationLog')
const FeedbackTargetLog = require('./feedbackTargetLog')
const ContinuousFeedback = require('./continuousFeedback')
const SummaryCustomisation = require('./summaryCustomisation')
const OrganisationFeedbackCorrespondent = require('./organisationFeedbackCorrespondent')
const Tag = require('./tag')
const CourseRealisationsTag = require('./courseRealisationsTag')
const Banner = require('./banner')
const InactiveCourseRealisation = require('./inactiveCourseRealisation')
const CourseUnitsTag = require('./courseUnitsTag')
const Group = require('./group')
const Summary = require('./summary')

FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
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
  foreign_key: 'organisation_id',
})

OrganisationLog.belongsTo(User, {
  as: 'user',
  foreign_key: 'user_id',
})

User.hasMany(OrganisationLog, { as: 'organisationLogs' })

Organisation.hasMany(OrganisationLog, { as: 'organisationLogs' })

FeedbackTargetLog.belongsTo(FeedbackTarget, {
  as: 'feedback_target',
  foreign_key: 'feedback_target_id',
})

FeedbackTargetLog.belongsTo(User, {
  as: 'user',
  foreign_key: 'user_id',
})

User.hasMany(FeedbackTargetLog, { as: 'feedbackTargetLogs' })

FeedbackTarget.hasMany(FeedbackTargetLog, { as: 'feedbackTargetLogs' })

ContinuousFeedback.belongsTo(FeedbackTarget, {
  as: 'feedback_target',
  foreign_key: 'feedback_target_id',
})

ContinuousFeedback.belongsTo(User, {
  as: 'user',
  foreign_key: 'user_id',
})

User.hasMany(ContinuousFeedback, { as: 'continuousFeedbacks' })

FeedbackTarget.hasMany(ContinuousFeedback, { as: 'continuousFeedbacks' })

User.hasOne(SummaryCustomisation, {
  as: 'summaryCustomisation',
  foreignKey: 'user_id',
})
SummaryCustomisation.belongsTo(User, { as: 'user', foreignKey: 'user_id' })

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

// Slightly fakd association here, as courseCode on CourseUnit is not unique constrained.
// It works somewhat, but custom queries may sometimes be needed
CourseUnit.belongsToMany(Tag, {
  through: CourseUnitsTag,
  sourceKey: 'courseCode',
  foreignKey: 'courseCode',
  as: 'tags',
})
Tag.hasMany(CourseUnitsTag)

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

Summary.belongsTo(CourseRealisation, { foreignKey: 'entityId', as: 'courseRealisation' })
CourseRealisation.hasOne(Summary, { foreignKey: 'entityId', as: 'summary' })

module.exports = {
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
  SummaryCustomisation,
  OrganisationFeedbackCorrespondent,
  CourseRealisationsTag,
  InactiveCourseRealisation,
  Banner,
  Tag,
  CourseUnitsTag,
  Group,
  Summary,
}
