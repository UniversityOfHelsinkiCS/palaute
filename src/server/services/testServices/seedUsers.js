const {
  User,
  FeedbackTargetLog,
  OrganisationFeedbackCorrespondent,
  Feedback,
  UserFeedbackTarget,
  NorppaFeedback,
} = require('../../models')

const seedUsers = async users => {
  for (const user of users) {
    await User.findOrCreate({
      where: {
        id: user.id,
      },
      defaults: user,
    })
  }
}

const clearUsers = async users => {
  for (const user of users) {
    await NorppaFeedback.destroy({
      where: {
        userId: user.id,
      },
    })
    await UserFeedbackTarget.destroy({
      where: {
        userId: user.id,
      },
    })
    await Feedback.destroy({
      where: {
        userId: user.id,
      },
    })
    await FeedbackTargetLog.destroy({
      where: {
        userId: user.id,
      },
    })
    await OrganisationFeedbackCorrespondent.destroy({
      where: {
        userId: user.id,
      },
    })
    await User.destroy({
      where: {
        id: user.id,
      },
    })
  }
}

module.exports = {
  seedUsers,
  clearUsers,
}
