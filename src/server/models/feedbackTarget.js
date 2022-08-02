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
  QueryTypes,
} = require('sequelize')

const _ = require('lodash')
const { format, differenceInHours } = require('date-fns')

const CourseUnit = require('./courseUnit')
const Organisation = require('./organisation')
const CourseRealisation = require('./courseRealisation')
const User = require('./user')
const UserFeedbackTarget = require('./userFeedbackTarget')
const { sequelize } = require('../util/dbConnection')
const Survey = require('./survey')
const Question = require('./question')

const { ApplicationError } = require('../util/customErrors')

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
const getPreviousFeedbackTarget = async (feedbackTarget) => {
  const courseRealisation = CourseRealisation.findByPk(
    feedbackTarget.courseRealisationId,
    { attributes: ['start_date'] },
  )

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
            [Op.lt]: (await courseRealisation).startDate,
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
    // lazily evaluate the 3 types of surveys
    const getProgrammeSurvey = async () => {
      const programmeSurvey = await sequelize.query(
        `
        SELECT s.id, s.question_ids as "questionIds"
        FROM
          surveys s, organisations o, course_units_organisations cu_o
        WHERE
          s.type = 'programme' AND
          s.type_id = o.code AND
          cu_o.course_unit_id = :courseUnitId AND
          cu_o.organisation_id = o.id AND
          ARRAY_LENGTH(s.question_ids, 1) > 0
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { courseUnitId: this.courseUnitId },
        },
      )

      for (const survey of programmeSurvey) {
        survey.questions = await Survey.getQuestionsOfSurvey(survey)
      }
      return programmeSurvey
    }

    const getTeacherSurvey = async () => {
      const previousFeedbackTarget = await getPreviousFeedbackTarget(this)
      const previousSurvey = previousFeedbackTarget
        ? Survey.findOne({
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
        (await createTeacherSurvey(this.id, await previousSurvey))
      await teacherSurvey.populateQuestions()
      return teacherSurvey
    }

    const getUniversitySurvey = async () => {
      const universitySurvey = await Survey.findOne({
        where: { type: 'university' },
      })
      await universitySurvey.populateQuestions()
      return universitySurvey
    }

    const [programmeSurvey, teacherSurvey, universitySurvey] =
      await Promise.all([
        getProgrammeSurvey(),
        getTeacherSurvey(),
        getUniversitySurvey(),
      ])

    return {
      programmeSurvey,
      teacherSurvey,
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

  async getProgrammePublicQuestionIds() {
    const programmePublicQuestionIdsResult = await sequelize.query(
      `
      SELECT o.public_question_ids as "publicQuestionIds" 
      FROM course_units_organisations cuo
      INNER JOIN organisations o ON o.id = cuo.organisation_id
      INNER JOIN feedback_targets fbt ON fbt.course_unit_id = cuo.course_unit_id
      WHERE fbt.id = :id AND cuo.type = 'PRIMARY'
      `,
      {
        replacements: {
          id: this.id,
        },
      },
    )

    return programmePublicQuestionIdsResult[0][0]?.publicQuestionIds
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
    const result = User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        attributes: [],
        where: {
          accessStatus: 'TEACHER',
          feedbackTargetId: this.id,
        },
      },
    })
    return result
  }

  async sendFeedbackSummaryReminderToStudents(feedbackResponse) {
    const courseUnit = await this.getCourseUnit()
    const cr = await this.getCourseRealisation()
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
      cr.startDate,
      cr.endDate,
      feedbackResponse,
    )
  }

  async sendFeedbackReminderToStudents(reminder) {
    if (differenceInHours(new Date(), this.feedbackReminderLastSentAt) < 24) {
      throw new ApplicationError(
        'Can send only 1 feedback reminder every 24 hours',
        403,
      )
    }

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

    return (async () => {
      const emails = await sendReminderToGiveFeedbackToStudents(
        url,
        formattedStudents,
        courseUnit.name,
        reminder,
        formattedClosesAt,
      )

      this.feedbackReminderLastSentAt = new Date()
      await this.save()

      return emails
    })()
  }

  async getPublicQuestionIds() {
    const targetPublicQuestionIds = this.publicQuestionIds ?? []

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()
    const programmePublicQuestionIds =
      await this.getProgrammePublicQuestionIds()

    const publicQuestionIds = _.uniq([
      ...programmePublicQuestionIds,
      ...targetPublicQuestionIds,
      ...globallyPublicQuestionIds,
    ])

    return publicQuestionIds
  }

  async getPublicityConfigurableQuestionIds(surveys) {
    this.populateQuestions(surveys)

    const globallyPublicQuestionIds = await getGloballyPublicQuestionIds()
    const programmePublicQuestionIds =
      await this.getProgrammePublicQuestionIds()

    const questionIds = this.questions
      .filter(
        ({ id }) =>
          !globallyPublicQuestionIds?.includes(id) &&
          !programmePublicQuestionIds?.includes(id),
      )
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

  async toPublicObject(includeSurveysAndTeachers) {
    if (!includeSurveysAndTeachers) return this.toJSON()

    const [surveys, teachers, publicQuestionIds] = await Promise.all([
      this.getSurveys(),
      this.getTeachersForFeedbackTarget(),
      this.getPublicQuestionIds(),
    ])
    const publicityConfigurableQuestionIds =
      await this.getPublicityConfigurableQuestionIds(surveys)

    const feedbackTarget = {
      ...this.toJSON(),
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
      responsibleTeachers: teachers,
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
    feedbackCount: {
      type: INTEGER,
      defaultValue: 0,
      allowNull: false,
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
    feedbackReminderLastSentAt: {
      type: DATE,
      defaultValue: null,
      allowNull: true,
    },
    feedbackVisibility: {
      type: TEXT,
      defaultValue: 'ENROLLED',
    },
    feedbackDatesEditedByTeacher: {
      type: BOOLEAN,
    },
    settingsReadByTeacher: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
