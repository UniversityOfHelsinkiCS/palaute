// Actions 'enum'
const UPDATE = 0
const UPDATE_RESPONSE = 1
const ALL_FEEDBACKS = 2
const PUBLIC_FEEDBACKS = 3
const STUDENTS = 4
const CONTINUOUS_FEEDBACKS = 5
const CONTINUOUS_FEEDBACK_RESPONSE = 6
const GIVE_CONTINUOUS_FEEDBACK = 7

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
  ],
  ORGANISATION_ADMIN: [UPDATE, ALL_FEEDBACKS, PUBLIC_FEEDBACKS, CONTINUOUS_FEEDBACKS],
  ORGANISATION_READ: [PUBLIC_FEEDBACKS],
  RESPONSIBLE_TEACHER: [
    UPDATE,
    UPDATE_RESPONSE,
    ALL_FEEDBACKS,
    PUBLIC_FEEDBACKS,
    STUDENTS,
    CONTINUOUS_FEEDBACKS,
    CONTINUOUS_FEEDBACK_RESPONSE,
  ],
  TEACHER: [PUBLIC_FEEDBACKS],
  STUDENT: [PUBLIC_FEEDBACKS, GIVE_CONTINUOUS_FEEDBACK],
  NONE: [],
}

// peace of mind
Object.freeze(RIGHTS)

const hasRight = (accessStatus, right) => (RIGHTS[accessStatus] ?? []).includes(right)

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
   * Can be sent to client as is
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