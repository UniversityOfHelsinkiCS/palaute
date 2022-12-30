// Actions 'enum'
const UPDATE = 0
const UPDATE_RESPONSE = 1
const ALL_FEEDBACKS = 2
const PUBLIC_FEEDBACKS = 3
const STUDENTS = 4

const RIGHTS = {
  ADMIN: [UPDATE, UPDATE_RESPONSE, ALL_FEEDBACKS, PUBLIC_FEEDBACKS, STUDENTS],
  ORGANISATION_ADMIN: [UPDATE, ALL_FEEDBACKS, PUBLIC_FEEDBACKS],
  ORGANISATION_READ: [PUBLIC_FEEDBACKS],
  RESPONSIBLE_TEACHER: [
    UPDATE,
    UPDATE_RESPONSE,
    ALL_FEEDBACKS,
    PUBLIC_FEEDBACKS,
    STUDENTS,
  ],
  TEACHER: [PUBLIC_FEEDBACKS],
  STUDENT: [PUBLIC_FEEDBACKS],
  NONE: [],
}

// peace of mind
Object.freeze(RIGHTS)

const hasRight = (accessStatus, right) =>
  (RIGHTS[accessStatus] ?? []).includes(right)

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
      ].find((a) => a.accessStatus === accessStatus) ?? this.NONE
    )
  }

  /*
   * Can be sent to client as is
   */
  toJSON() {
    return this.accessStatus
  }
}

// Important!
Object.freeze(Access)

module.exports = {
  Access,
}
