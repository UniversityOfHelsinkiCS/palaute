export class ApplicationError extends Error {
  status: number
  extra: any

  constructor(message: string, status?: number, extra?: any) {
    super(message)

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name

    this.message = message || 'Something went wrong. Please try again.'

    this.status = status || 500

    this.extra = extra || {}
  }

  toJSON() {
    return {
      error: this.message,
    }
  }

  /**
   *
   * @param {string} msg
   * @throws {ApplicationError}
   */
  static NotFound(msg = 'Not found') {
    throw new ApplicationError(msg, 404)
  }

  /**
   *
   * @param {string} msg
   * @throws {ApplicationError}
   */
  static Forbidden(msg = 'Forbidden') {
    throw new ApplicationError(msg, 403)
  }

  /**
   *
   * @param {string} msg
   * @throws {ApplicationError}
   */
  static Conflict(msg = 'Conflict') {
    throw new ApplicationError(msg, 409)
  }

  /**
   *
   * @param {string} msg
   * @throws {ApplicationError}
   */
  static BadRequest(msg = 'Bad request') {
    throw new ApplicationError(msg, 400)
  }
}
