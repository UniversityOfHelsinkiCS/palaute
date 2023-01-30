const _ = require('lodash')

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

const ALL = [
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
].sort()

Object.freeze(ALL)

// Validate that there are no duplicate numberings
if (!_.isEqual(_.uniq(ALL), ALL))
  throw new Error('Access actions are invalidly numbered. Fix them at... (see trace below)')

/**
 * Describes what actions are allowed, given some access status
 */
const RIGHTS = {
  ADMIN: ALL,
  ORGANISATION_ADMIN: [UPDATE, ALL_FEEDBACKS, PUBLIC_FEEDBACKS, CONTINUOUS_FEEDBACKS, STUDENTS, HIDE_FEEDBACK],
  ORGANISATION_READ: [PUBLIC_FEEDBACKS],
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
  ],
  TEACHER: [PUBLIC_FEEDBACKS],
  STUDENT: [PUBLIC_FEEDBACKS, GIVE_CONTINUOUS_FEEDBACK, GIVE_FEEDBACK],
  NONE: [],
}

// peace of mind
Object.freeze(RIGHTS)

/**
 * Checks whether given access status allows given action
 */
const hasRight = (accessStatus, action) => (RIGHTS[accessStatus] ?? []).includes(action)

class Access {
  constructor(accessStatus) {
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

  // Role enum

  static ADMIN = new Access('ADMIN')

  static RESPONSIBLE_TEACHER = new Access('RESPONSIBLE_TEACHER')

  static TEACHER = new Access('TEACHER')

  static ORGANISATION_ADMIN = new Access('ORGANISATION_ADMIN')

  static ORGANISATION_READ = new Access('ORGANISATION_READ')

  static STUDENT = new Access('STUDENT')

  static NONE = new Access('NONE')

  static For(accessStatus) {
    return (
      [
        this.ADMIN,
        this.RESPONSIBLE_TEACHER,
        this.TEACHER,
        this.ORGANISATION_ADMIN,
        this.ORGANISATION_READ,
        this.STUDENT,
      ].find(a => a.accessStatus === accessStatus) ?? this.NONE
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

module.exports = {
  Access,
}
