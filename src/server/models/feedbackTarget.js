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

const Organisation = require('./organisation')
const CourseRealisation = require('./courseRealisation')
const User = require('./user')
const UserFeedbackTarget = require('./userFeedbackTarget')
const { sequelize } = require('../util/dbConnection')
const {
  getUniversitySurvey,
  getProgrammeSurveysByCourseUnit,
  getOrCreateTeacherSurvey,
} = require('../services/surveys')

const getGloballyPublicQuestionIds = async () => {
  const universitySurvey = await getUniversitySurvey()

  const numericQuestionIds = universitySurvey.questions
    .filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)

  return numericQuestionIds
}

class FeedbackTarget extends Model {
  async getSurveys() {
    const [programmeSurveys, teacherSurvey, universitySurvey] =
      await Promise.all([
        getProgrammeSurveysByCourseUnit(this.courseUnitId),
        getOrCreateTeacherSurvey(this),
        getUniversitySurvey(),
      ])

    return {
      programmeSurveys,
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

    const publicQuestionIds =
      programmePublicQuestionIdsResult[0][0]?.publicQuestionIds

    return Array.isArray(publicQuestionIds) ? publicQuestionIds : []
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

  async getStudentCount() {
    return UserFeedbackTarget.count({
      where: { feedbackTargetId: this.id, accessStatus: 'STUDENT' },
    })
  }

  async getTeachersForFeedbackTarget() {
    const result = await User.findAll({
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
      order: [['lastName', 'asc']],
    })
    return result
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
    const programmeSurveyQuestions = surveys.programmeSurveys
      ? surveys.programmeSurveys.reduce(
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

    const [surveys, teachers, publicQuestionIds, studentCount] =
      await Promise.all([
        this.getSurveys(),
        this.getTeachersForFeedbackTarget(),
        this.getPublicQuestionIds(),
        this.getStudentCount(),
      ])
    const publicityConfigurableQuestionIds =
      await this.getPublicityConfigurableQuestionIds(surveys)

    const feedbackTarget = {
      ...this.toJSON(),
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
      responsibleTeachers: teachers,
      studentCount,
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

  /**
   * Gets the previous feedback target that has at least one same teacher
   * @returns {Promise<FeedbackTarget?>} its previous feedback target
   */
  async getPrevious() {
    const courseRealisation = CourseRealisation.findByPk(
      this.courseRealisationId,
      { attributes: ['start_date'] },
    )

    const currentTeachers = UserFeedbackTarget.findAll({
      attributes: ['userId'],
      where: {
        feedbackTargetId: this.id,
        accessStatus: 'TEACHER',
      },
    })
    /* eslint-disable-next-line no-use-before-define */
    const allPreviousFeedbackTargets = await FeedbackTarget.findAll({
      where: {
        courseUnitId: this.courseUnitId,
        feedbackType: this.feedbackType,
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
          attributes: ['userId'],
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
      ({ userId }) => userId,
    )

    return allPreviousFeedbackTargets.find((fbt) =>
      fbt.userFeedbackTargets.some((ufbt) =>
        currentTeacherIds.includes(ufbt.user_id),
      ),
    )
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
    continuousFeedbackEnabled: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sendContinuousFeedbackDigestEmail: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
  },
)

module.exports = FeedbackTarget
