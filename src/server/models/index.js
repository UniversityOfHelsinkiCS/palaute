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
const FeedbackSummaryCache = require('./feedbackSummaryCache')
const NorppaFeedback = require('./norppaFeedback')
const UpdaterStatus = require('./updaterStatus')
const FeedbackTargetDateCheck = require('./feedbackTargetDateCheck')
const OrganisationLog = require('./organisationLog')
const FeedbackTargetLog = require('./feedbackTargetLog')

FeedbackTarget.belongsTo(CourseUnit, {
  as: 'courseUnit',
})

FeedbackTarget.belongsTo(CourseRealisation, {
  foreignKey: 'courseRealisationId',
  as: 'courseRealisation',
})

UserFeedbackTarget.belongsTo(FeedbackTarget, { as: 'feedbackTarget' })
FeedbackTarget.hasMany(UserFeedbackTarget, { as: 'userFeedbackTargets' })

UserFeedbackTarget.belongsTo(Feedback, {
  as: 'feedback',
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

CourseUnit.belongsToMany(Organisation, {
  through: CourseUnitsOrganisation,
  as: 'organisations',
})

Organisation.belongsToMany(CourseUnit, {
  through: CourseUnitsOrganisation,
  as: 'courseUnits',
})

CourseRealisation.belongsToMany(Organisation, {
  through: CourseRealisationsOrganisation,
  as: 'organisations',
})

Organisation.belongsToMany(CourseRealisation, {
  through: CourseRealisationsOrganisation,
  as: 'courseRealisations',
})

// eslint-disable-next-line func-names
User.prototype.feedbackTargetsHasTeacherAccessTo = function () {
  return FeedbackTarget.findAll({
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      where: {
        userId: this.id,
        accessStatus: 'TEACHER',
      },
      required: true,
    },
  })
}

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

FeedbackTargetDateCheck.belongsTo(FeedbackTarget, {
  as: 'feedback_target',
  foreign_key: 'feedback_target_id',
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

User.hasMany(FeedbackTargetLog, { as: 'FeedbackTargetLogs' })

FeedbackTarget.hasMany(FeedbackTargetLog, { as: 'FeedbackTargetLogs' })

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
  FeedbackSummaryCache,
  NorppaFeedback,
  UpdaterStatus,
  FeedbackTargetDateCheck,
  OrganisationLog,
  FeedbackTargetLog,
}
