import _ from 'lodash'

// Actions 'enum'
// HEY YOU THERE if you can think of better solution, its your responsibility to implement!!!
// gotta be very careful with these numbers
const UPDATE = 0
const UPDATE_RESPONSE = 1
const ALL_FEEDBACKS = 2
const PUBLIC_FEEDBACKS = 3
const STUDENTS = 4
const CONTINUOUS_FEEDBACKS = 5
const CONTINUOUS_FEEDBACK_RESPONSE = 6
const GIVE_CONTINUOUS_FEEDBACK = 7
const GIVE_FEEDBACK = 8
const HIDE_FEEDBACK = 9
const LOGS = 10
const DELETE_TEACHER = 11
const TOKENS = 12
const SEND_REMINDER_EMAIL = 13
const CREATE_INTERIM_FEEDBACK = 14
const DELETE_ANSWER = 15
const UPDATE_ORGANISATION_SURVEYS = 16
const ENABLE_TOKEN_ENROLMENT = 17 // @feat Gradu survey
const ALWAYS_SEE_STUDENTS = 18

/**
 * Describes what actions are allowed, given some access status
 */
const RIGHTS = {
  ADMIN: [
    UPDATE,
    UPDATE_RESPONSE,
    ALL_FEEDBACKS,
    PUBLIC_FEEDBACKS,
    STUDENTS,
    CONTINUOUS_FEEDBACKS,
    CONTINUOUS_FEEDBACK_RESPONSE,
    GIVE_CONTINUOUS_FEEDBACK,
    GIVE_FEEDBACK,
    HIDE_FEEDBACK,
    LOGS,
    DELETE_TEACHER,
    TOKENS,
    SEND_REMINDER_EMAIL,
    CREATE_INTERIM_FEEDBACK,
    DELETE_ANSWER,
    UPDATE_ORGANISATION_SURVEYS,
    ENABLE_TOKEN_ENROLMENT,
    ALWAYS_SEE_STUDENTS,
  ],
  ORGANISATION_ADMIN: [
    UPDATE,
    ALL_FEEDBACKS,
    PUBLIC_FEEDBACKS,
    CONTINUOUS_FEEDBACKS,
    STUDENTS,
    SEND_REMINDER_EMAIL,
    HIDE_FEEDBACK,
    UPDATE_ORGANISATION_SURVEYS,
    ENABLE_TOKEN_ENROLMENT,
  ],
  ORGANISATION_READ: [PUBLIC_FEEDBACKS, GIVE_CONTINUOUS_FEEDBACK],
  RESPONSIBLE_TEACHER: [
    UPDATE,
    UPDATE_RESPONSE,
    ALL_FEEDBACKS,
    PUBLIC_FEEDBACKS,
    STUDENTS,
    CONTINUOUS_FEEDBACKS,
    CONTINUOUS_FEEDBACK_RESPONSE,
    SEND_REMINDER_EMAIL,
    HIDE_FEEDBACK,
    CREATE_INTERIM_FEEDBACK,
    UPDATE_ORGANISATION_SURVEYS,
    ENABLE_TOKEN_ENROLMENT,
  ],
  TEACHER: [PUBLIC_FEEDBACKS],
  STUDENT: [PUBLIC_FEEDBACKS, GIVE_CONTINUOUS_FEEDBACK, GIVE_FEEDBACK],
  NONE: [] as number[],
} as const

const ALL = RIGHTS.ADMIN

Object.freeze(ALL)

// Validate that there are no duplicate numberings
if (!_.isEqual(_.uniq(ALL), ALL))
  throw new Error('Access actions are invalidly numbered. Fix them at... (see trace below)')

type ROLE = keyof typeof RIGHTS
type Actions = (typeof ALL)[number]

// peace of mind
Object.freeze(RIGHTS)

/**
 * Checks whether given access status allows given action
 */
const hasRight = (accessStatuses: ROLE[], action: Actions) =>
  accessStatuses.some(accessStatus => {
    const allowedActions = RIGHTS[accessStatus] as number[]
    return allowedActions.includes(action)
  })

class Access {
  accessStatus: ROLE[]

  constructor(accessStatus: ROLE[]) {
    this.accessStatus = accessStatus
  }

  canUpdate() {
    return hasRight(this.accessStatus, UPDATE)
  }

  canUpdateResponse() {
    return hasRight(this.accessStatus, UPDATE_RESPONSE)
  }

  canSeeAllFeedbacks() {
    return hasRight(this.accessStatus, ALL_FEEDBACKS)
  }

  canSeePublicFeedbacks() {
    return hasRight(this.accessStatus, PUBLIC_FEEDBACKS)
  }

  canSeeStudents() {
    return hasRight(this.accessStatus, STUDENTS)
  }

  canSeeContinuousFeedbacks() {
    return hasRight(this.accessStatus, CONTINUOUS_FEEDBACKS)
  }

  canRespondToContinuousFeedback() {
    return hasRight(this.accessStatus, CONTINUOUS_FEEDBACK_RESPONSE)
  }

  canGiveContinuousFeedback() {
    return hasRight(this.accessStatus, GIVE_CONTINUOUS_FEEDBACK)
  }

  canGiveFeedback() {
    return hasRight(this.accessStatus, GIVE_FEEDBACK)
  }

  canHideFeedback() {
    return hasRight(this.accessStatus, HIDE_FEEDBACK)
  }

  canAdminDeleteFeedback() {
    return hasRight(this.accessStatus, DELETE_ANSWER)
  }

  canSeeLogs() {
    return hasRight(this.accessStatus, LOGS)
  }

  canDeleteTeacher() {
    return hasRight(this.accessStatus, DELETE_TEACHER)
  }

  canSeeTokens() {
    return hasRight(this.accessStatus, TOKENS)
  }

  canSendReminderEmail() {
    return hasRight(this.accessStatus, SEND_REMINDER_EMAIL)
  }

  canCreateInterimFeedback() {
    return hasRight(this.accessStatus, CREATE_INTERIM_FEEDBACK)
  }

  canUpdateOrganisationSurvey() {
    return hasRight(this.accessStatus, UPDATE_ORGANISATION_SURVEYS)
  }

  canEnableTokenEnrolment() {
    return hasRight(this.accessStatus, ENABLE_TOKEN_ENROLMENT)
  }

  canAlwaysSeeStudents() {
    return hasRight(this.accessStatus, ALWAYS_SEE_STUDENTS)
  }

  // Role enum

  static ADMIN = new Access(['ADMIN'])

  static RESPONSIBLE_TEACHER = new Access(['RESPONSIBLE_TEACHER'])

  static TEACHER = new Access(['TEACHER'])

  static ORGANISATION_ADMIN = new Access(['ORGANISATION_ADMIN'])

  static ORGANISATION_READ = new Access(['ORGANISATION_READ'])

  static STUDENT = new Access(['STUDENT'])

  static NONE = new Access(['NONE'])

  static mergeAccesses(accesses: Access[]) {
    const accessStatuses = accesses.map(a => a.accessStatus)

    return new Access(accessStatuses.flat())
  }

  static For(accessStatus: ROLE) {
    return (
      [
        this.ADMIN,
        this.RESPONSIBLE_TEACHER,
        this.TEACHER,
        this.ORGANISATION_ADMIN,
        this.ORGANISATION_READ,
        this.STUDENT,
      ].find(a => a.accessStatus.includes(accessStatus)) ?? this.NONE
    )
  }

  /*
   * Can be sent to client as is. Serializes to the accessStatus
   */
  toJSON() {
    return this.accessStatus
  }
}

// Important! Dont let anyone mess with this object
Object.freeze(Access)

export { Access }
