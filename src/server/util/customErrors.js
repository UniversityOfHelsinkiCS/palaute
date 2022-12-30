class ApplicationError extends Error {
  constructor(message, status, extra) {
    super()

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
}

module.exports = {
  ApplicationError,
}
