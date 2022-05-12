/* eslint-disable camelcase */
const {
  Op,
  DATE,
  ENUM,
  STRING,
  Model,
  JSONB,
  BOOLEAN,
  VIRTUAL,
  ARRAY,
  INTEGER,
  TEXT,
} = require('sequelize')

const _ = require('lodash')
const { format } = require('date-fns')

const CourseUnit = require('./courseUnit')
const Organisation = require('./organisation')
const CourseRealisation = require('./courseRealisation')
const User = require('./user')
const UserFeedbackTarget = require('./userFeedbackTarget')
const { sequelize } = require('../util/dbConnection')
const Survey = require('./survey')
const Question = require('./question')

const {
  sendNotificationAboutFeedbackResponseToStudents,
  sendReminderToGiveFeedbackToStudents,
} = require('../util/pate')

const getGloballyPublicQuestionIds = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const numericQuestionIds = universitySurvey.questions
    .filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)

  return numericQuestionIds
}

const getClonedQuestionIds = async (previousSurvey) => {
  if (!previousSurvey) return []

  const previousQuestions = await Question.findAll({
    where: {
      id: previousSurvey.questionIds,
    },
  })

  const clonedQuestions = await Question.bulkCreate(
    previousQuestions.map(({ type, required, data }) => ({
      type,
      required,
      data,
    })),
    { returning: true },
  )

  return clonedQuestions.map((q) => q.id)
}

const createTeacherSurvey = async (feedbackTargetId, previousSurvey) => {
  const clonedQuestionIds = await getClonedQuestionIds(previousSurvey)

  const teacherSurvey = await Survey.create({
    feedbackTargetId,
    questionIds: clonedQuestionIds,
  })

  return teacherSurvey
}

/**
 * Gets the previous feedback target that has at least one teacher from given feedback target
 */
const getPreviousFeedbackTarget = async (feedbackTarget, courseRealisation) => {
  const currentTeachers = UserFeedbackTarget.findAll({
    attributes: ['user_id'],
    where: {
      feedbackTargetId: feedbackTarget.id,
      accessStatus: 'TEACHER',
    },
  })
  /* eslint-disable-next-line no-use-before-define */
  const allPreviousFeedbackTargets = await FeedbackTarget.findAll({
    where: {
      courseUnitId: feedbackTarget.courseUnitId,
      feedbackType: feedbackTarget.feedbackType,
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        where: {
          startDate: {
            [Op.lt]: courseRealisation.startDate,
          },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        attributes: ['user_id'],
        where: {
          accessStatus: 'TEACHER',
        },
      },
    ],
    order: [
      [
        { model: CourseRealisation, as: 'courseRealisation' },
        'startDate',
        'DESC',
      ],
    ],
  })
  if (!allPreviousFeedbackTargets || allPreviousFeedbackTargets.length === 0)
    return null

  const currentTeacherIds = (await currentTeachers).map(
    ({ user_id }) => user_id,
  )

  return allPreviousFeedbackTargets.find((fbt) =>
    fbt.userFeedbackTargets.some((ufbt) =>
      currentTeacherIds.includes(ufbt.user_id),
    ),
  )
}

class FeedbackTarget extends Model {
  async getSurveys() {
    const courseUnit = await CourseUnit.findByPk(this.courseUnitId, {
      include: [
        {
          model: Organisation,
          as: 'organisations',
        },
      ],
    })

    const organisations =
      courseUnit.organisations.length > 1
        ? courseUnit.organisations.filter((org) => org.code !== 'H930')
        : courseUnit.organisations[0]

    const organisationCodes =
      organisations.length > 1
        ? organisations.map((org) => org.code)
        : [organisations.code]

    const courseRealisation = await CourseRealisation.findByPk(
      this.courseRealisationId,
    )

    const previousFeedbackTarget = await getPreviousFeedbackTarget(
      this,
      courseRealisation,
    )

    const previousSurvey = previousFeedbackTarget
      ? await Survey.findOne({
          where: {
            feedbackTargetId: previousFeedbackTarget.id,
          },
        })
      : null

    const existingTeacherSurvey = await Survey.findOne({
      where: {
        feedbackTargetId: this.id,
      },
    })

    const teacherSurvey =
      existingTeacherSurvey ||
      (await createTeacherSurvey(this.id, previousSurvey))

    const universitySurvey = await Survey.findOne({
      where: { type: 'university' },
    })

    const programmeSurvey = organisations
      ? await Survey.findAll({
          where: { type: 'programme', typeId: { [Op.in]: organisationCodes } },
        })
      : null

    await teacherSurvey.populateQuestions()
    await universitySurvey.populateQuestions()

    for (const survey of programmeSurvey) {
      await survey.populateQuestions()
    }

    return {
      teacherSurvey,
      programmeSurvey,
      universitySurvey,
    }
  }

  isOpen() {
    if (!this.opensAt || !this.closesAt) {
      return true
    }

    const now = new Date()

    return this.opensAt <= now && this.closesAt >= now
  }

  isEnded() {
    if (!this.closesAt) {
      return true
    }

    const now = new Date()

    return now > this.closesAt
  }

  async getStudentsForFeedbackTarget() {
    return User.findAll({
      include: {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        include: [
          {
            model: FeedbackTarget,
            as: 'feedbackTarget',
            where: {
              id: this.id,
            },
            required: true,
          },
        ],
        where: {
          accessStatus: 'STUDENT',
        },
      },
    })
  }

  async getStudentsWhoHaveNotGivenFeedback() {
    return User.findAll({
      include: {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        include: [
          {
            model: FeedbackTarget,
            as: 'feedbackTarget',
            where: {
              id: this.id,
            },
            required: true,
          },
        ],
        where: {
          accessStatus: 'STUDENT',
          feedbackId: {
            [Op.is]: null,
          },
        },
      },
    })
  }

  async getTeachersForFeedbackTarget() {
    return User.findAll({
      include: {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        include: [
          {
            model: FeedbackTarget,
            as: 'feedbackTarget',
            where: {
              id: this.id,
            },
            required: true,
          },
        ],
        where: {
          accessStatus: 'TEACHER',
        },
      },
    })
  }

  async sendFeedbackSummaryReminderToStudents(feedbackResponse) {
    const courseUnit = await CourseUnit.findByPk(this.courseUnitId)
    const students = await this.getStudentsForFeedbackTarget()
    const url = `https://coursefeedback.helsinki.fi/targets/${this.id}/results`
    const formattedStudents = students
      .filter((student) => student.email)
      .map((student) => ({
        email: student.email,
        language: student.language || 'en',
      }))
    return sendNotificationAboutFeedbackResponseToStudents(
      url,
      formattedStudents,
      courseUnit.name,
      feedbackResponse,
    )
  }

  async sendFeedbackReminderToStudents(reminder) {
    const courseUnit = await CourseUnit.findByPk(this.courseUnitId)
    const students = await this.getStudentsWhoHaveNotGivenFeedback()
    const url = `https://coursefeedback.helsinki.fi/targets/${this.id}/feedback`
    const formattedStudents = students
      .filter((student) => student.email)
      .map((student) => ({
        email: student.email,
        language: student.language || 'en',
      }))

    const formattedClosesAt = format(new Date(this.closesAt), 'dd.MM.yyyy')

    return sendReminderToGiveFeedbackToStudents(
      url,
      formattedStudents,
      courseUnit.name,
      reminder,
      formattedClosesAt,
    )
  }

  async getPublicQuestionIds() {
    const targetPublicQuestionIds = this.publicQuestionIds ?? []

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()

    const publicQuestionIds = _.uniq([
      ...targetPublicQuestionIds,
      ...globallyPublicQuestionIds,
    ])

    return publicQuestionIds
  }

  async getPublicityConfigurableQuestionIds(surveys) {
    this.populateQuestions(surveys)

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()

    const questionIds = this.questions
      .filter(({ id }) => !globallyPublicQuestionIds.includes(id))
      .map(({ id }) => id)

    return questionIds
  }

  populateQuestions(surveys) {
    const programmeSurveyQuestions = surveys.programmeSurvey
      ? surveys.programmeSurvey.reduce(
          (questions, survey) => questions.concat(survey.questions),
          [],
        )
      : null

    const questions = [
      ...(surveys.universitySurvey?.questions ?? []),
      ...(programmeSurveyQuestions ?? []),
      ...(surveys.teacherSurvey?.questions ?? []),
    ]

    this.set('questions', questions)
  }

  async populateSurveys() {
    const surveys = await this.getSurveys()

    this.populateQuestions(surveys)

    this.set('surveys', surveys)
  }

  async getPublicFeedbacks(
    feedbacks,
    { accessStatus, isAdmin, userOrganisationAccess } = {},
  ) {
    const publicFeedbacks = feedbacks.map((f) => f.toPublicObject())
    const isTeacher = accessStatus === 'TEACHER'

    const isOrganisationAdmin = Boolean(userOrganisationAccess?.admin)

    if (isAdmin || isOrganisationAdmin || isTeacher) {
      return publicFeedbacks
    }

    const publicQuestionIds = await this.getPublicQuestionIds()

    const filteredFeedbacks = publicFeedbacks.map((feedback) => ({
      ...feedback,
      data: feedback.data.filter((question) =>
        publicQuestionIds.includes(question.questionId),
      ),
    }))

    return filteredFeedbacks
  }

  async toPublicObject() {
    const surveys = await this.getSurveys()
    const publicQuestionIds = await this.getPublicQuestionIds()
    const publicityConfigurableQuestionIds =
      await this.getPublicityConfigurableQuestionIds(surveys)

    const feedbackTarget = {
      ...this.toJSON(),
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
    }

    delete feedbackTarget.userFeedbackTargets

    return feedbackTarget
  }

  async isDisabled() {
    const courseUnit = await this.getCourseUnit({
      include: [{ model: Organisation, as: 'organisations', required: true }],
    })

    const { organisations } = courseUnit

    return organisations.some(({ disabledCourseCodes }) =>
      disabledCourseCodes.includes(courseUnit.courseCode),
    )
  }

  async feedbackCanBeGiven() {
    if (!this.isOpen() || this.hidden) {
      return false
    }

    const disabled = await this.isDisabled()

    return !disabled
  }
}

FeedbackTarget.init(
  {
    feedbackType: {
      type: ENUM,
      values: ['courseRealisation', 'assessmentItem', 'studySubGroup'],
      allowNull: false,
      unique: 'source',
    },
    typeId: {
      type: STRING,
      allowNull: false,
      unique: 'source',
    },
    courseUnitId: {
      type: STRING,
      allowNull: false,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    hidden: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    opensAt: {
      type: DATE,
    },
    closesAt: {
      type: DATE,
    },
    questions: {
      type: VIRTUAL,
    },
    publicQuestionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
      defaultValue: [],
    },
    feedbackResponse: {
      type: TEXT,
    },
    feedbackResponseEmailSent: {
      type: BOOLEAN,
    },
    feedbackOpeningReminderEmailSent: {
      type: BOOLEAN,
    },
    feedbackResponseReminderEmailSent: {
      type: BOOLEAN,
    },
    feedbackReminderEmailToStudentsSent: {
      type: BOOLEAN,
    },
    feedbackVisibility: {
      type: TEXT,
      defaultValue: 'ENROLLED',
    },
    feedbackDatesEditedByTeacher: {
      type: BOOLEAN,
    },
    surveys: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = FeedbackTarget
