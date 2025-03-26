import {
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
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  HasOneGetAssociationMixin,
} from 'sequelize'

import _ from 'lodash'

import { LocalizedString } from '@common/types'
import Organisation from './organisation'
import CourseRealisation from './courseRealisation'
import { User } from './user'
import { UserFeedbackTarget } from './userFeedbackTarget'
import { sequelize } from '../db/dbConnection'
import Feedback from './feedback'
import CourseUnit from './courseUnit'
import { Question } from './question'
import Survey from './survey'

class FeedbackTarget extends Model<InferAttributes<FeedbackTarget>, InferCreationAttributes<FeedbackTarget>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<number>
  declare feedbackType: 'courseRealisation' | 'assessmentItem' | 'studySubGroup'
  declare typeId: string
  declare courseUnitId: ForeignKey<string>
  declare courseRealisationId: string
  declare name: LocalizedString
  declare hidden: CreationOptional<boolean>
  declare hiddenCount: CreationOptional<number>
  declare opensAt: Date
  declare closesAt: Date
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare publicQuestionIds: CreationOptional<number[]>
  declare feedbackResponse: string
  declare feedbackResponseEmailSent: boolean
  declare feedbackOpeningReminderEmailSent: boolean
  declare feedbackResponseReminderEmailSent: boolean
  declare feedbackReminderLastSentAt: CreationOptional<Date | null>
  declare feedbackVisibility: CreationOptional<string>
  declare feedbackDatesEditedByTeacher: CreationOptional<boolean>
  declare settingsReadByTeacher: CreationOptional<boolean>
  declare continuousFeedbackEnabled: CreationOptional<boolean>
  declare sendContinuousFeedbackDigestEmail: CreationOptional<boolean>
  declare tokenEnrolmentEnabled: CreationOptional<boolean>
  declare userCreated: CreationOptional<boolean>

  // --- Virtual fields. ---------
  // --- ideally refactor away ---
  // -----------------------------
  declare surveys?: any
  declare questions?: Question[]
  declare questionOrder?: any
  declare responsibleTeachers?: any
  declare teachers?: any
  declare administrativePersons?: any
  declare tags?: any
  declare studentCount?: number
  declare continuousFeedbackCount?: number
  declare userFeedbackTargets?: UserFeedbackTarget[]

  // --- Association methods -----------------------------
  // --- only the ones that are used are declared here ---
  // -----------------------------------------------------
  declare getCourseUnit: HasOneGetAssociationMixin<CourseUnit>

  // --- Association includes ------
  // --- not sure how to do this ---
  // -------------------------------
  // declare userFeedbackTargets?: NonAttribute<UserFeedbackTarget[]>

  // --- Helper methods ---
  // ----------------------
  declare getSurveys: () => Promise<{
    programmeSurveys: Survey[]
    teacherSurvey: Survey
    universitySurvey: Survey
  }>

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

  async getStudentsWhoHaveNotReactedToSurvey() {
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
          notGivingFeedback: false,
          feedbackId: {
            [Op.is]: null,
          },
        },
      },
    })
  }

  getPublicQuestionIds(surveys: any) {
    const targetPublicQuestionIds = this.publicQuestionIds ?? []

    const globallyPublicQuestionIds = surveys.universitySurvey.publicQuestionIds
    const programmePublicQuestionIds = surveys.programmeSurveys.flatMap((s: any) => s.publicQuestionIds)

    const publicQuestionIds = _.uniq([
      ...programmePublicQuestionIds,
      ...targetPublicQuestionIds,
      ...globallyPublicQuestionIds,
    ])

    return publicQuestionIds
  }

  getPublicityConfigurableQuestionIds(surveys: any) {
    this.populateQuestions(surveys)

    const globallyPublicQuestionIds = surveys.universitySurvey.publicQuestionIds
    const programmePublicQuestionIds = surveys.programmeSurveys.flatMap((s: any) => s.publicQuestionIds)

    const questionIds = this.questions
      .filter(({ id }) => !globallyPublicQuestionIds?.includes(id) && !programmePublicQuestionIds?.includes(id))
      .map(({ id }) => id)

    return questionIds
  }

  populateQuestions(surveys: any) {
    const programmeSurveyQuestions = surveys.programmeSurveys
      ? surveys.programmeSurveys.flatMap((s: any) => s.questions)
      : null

    const questions = [
      ...(surveys.universitySurvey?.questions ?? []),
      ...(programmeSurveyQuestions ?? []),
      ...(surveys.teacherSurvey?.questions ?? []),
    ]

    this.set('questions', questions)
    this.set(
      'questionOrder',
      questions.map(q => q.id)
    )
  }

  populateSurveys(surveys: any) {
    this.set('surveys', surveys)
    this.populateQuestions(surveys)
  }

  // @ts-expect-error täsäfy
  async getPublicFeedbacks(feedbacks: Feedback[], { accessStatus, isAdmin, userOrganisationAccess } = {}) {
    const publicFeedbacks = feedbacks.map(f => f.toPublicObject())

    const isTeacher = accessStatus === 'RESPONSIBLE_TEACHER' || accessStatus === 'TEACHER'

    const isOrganisationAdmin = Boolean(userOrganisationAccess?.admin)

    if (isAdmin || isOrganisationAdmin || isTeacher) {
      return publicFeedbacks
    }

    const surveys = await this.getSurveys()
    const publicQuestionIds = this.getPublicQuestionIds(surveys)

    const censoredFeedbacks = publicFeedbacks.map(feedback => ({
      ...feedback,
      data: feedback.data.filter(answer => !answer.hidden && publicQuestionIds.includes(answer.questionId)),
    }))

    return censoredFeedbacks
  }

  async toPublicObject() {
    const surveys = await this.getSurveys()
    const publicQuestionIds = this.getPublicQuestionIds(surveys)
    const publicityConfigurableQuestionIds = this.getPublicityConfigurableQuestionIds(surveys)

    const feedbackTarget = {
      ...this.toJSON(),
      surveys,
      publicQuestionIds,
      publicityConfigurableQuestionIds,
    }

    // Do not accidentally send this to client
    delete feedbackTarget.userFeedbackTargets

    return feedbackTarget
  }

  async isDisabled() {
    const courseUnit = await this.getCourseUnit({
      include: [{ model: Organisation, as: 'organisations', required: true }],
    })

    if (!courseUnit) return false

    // @ts-expect-error täsäfy
    const { organisations } = courseUnit

    // @ts-expect-error täsäfy
    return organisations.some(({ disabledCourseCodes }) => disabledCourseCodes.includes(courseUnit.courseCode))
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
    if (this.userCreated) return null

    const courseRealisation = CourseRealisation.findByPk(this.courseRealisationId, { attributes: ['startDate'] })

    const currentTeachers = UserFeedbackTarget.findAll({
      attributes: ['userId'],
      where: {
        feedbackTargetId: this.id,
        accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
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
              // @ts-expect-error täsäfy
              [Op.lt]: (await courseRealisation).startDate,
            },
          },
        },
        {
          model: UserFeedbackTarget,
          as: 'userFeedbackTargets',
          attributes: ['userId'],
          where: {
            accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
          },
        },
      ],
      order: [[{ model: CourseRealisation, as: 'courseRealisation' }, 'startDate', 'DESC']],
    })

    const currentTeacherIds = (await currentTeachers).map(({ userId }) => userId)

    const previousTargetsWithSameTeacher = allPreviousFeedbackTargets.filter(fbt =>
      fbt.userFeedbackTargets.some(ufbt => currentTeacherIds.includes(ufbt.userId))
    )

    if (previousTargetsWithSameTeacher.length < 1) {
      return null
    }

    return previousTargetsWithSameTeacher[0]
  }
}

FeedbackTarget.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
    hiddenCount: {
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
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
    // potentially cached
    surveys: {
      type: VIRTUAL,
    },
    // potentially cached
    questions: {
      type: VIRTUAL,
    },
    // potentially cached
    questionOrder: {
      type: VIRTUAL,
    },
    // potentially cached
    responsibleTeachers: {
      type: VIRTUAL,
    },
    // potentially cached
    teachers: {
      type: VIRTUAL,
    },
    // potentially cached
    administrativePersons: {
      type: VIRTUAL,
    },
    // potentially cached
    tags: {
      type: VIRTUAL,
    },
    studentCount: {
      type: VIRTUAL,
      get() {
        return this.dataValues.studentCount ? Number(this.dataValues.studentCount) : 0
      },
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
    continuousFeedbackEnabled: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    continuousFeedbackCount: {
      type: VIRTUAL,
      get() {
        return this.dataValues.continuousFeedbackCount ?? 0
      },
    },
    sendContinuousFeedbackDigestEmail: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tokenEnrolmentEnabled: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
    defaultScope: {
      where: {
        hidden: false,
      },
    },
  }
)

export { FeedbackTarget }
