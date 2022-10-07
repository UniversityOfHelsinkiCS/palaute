const getUniversitySurvey = require('./universitySurvey')
const {
  getProgrammeSurveysByCourseUnit,
  getProgrammeSurvey,
} = require('./programmeSurvey')
const getOrCreateTeacherSurvey = require('./teacherSurvey')

module.exports = {
  getUniversitySurvey,
  getProgrammeSurvey,
  getProgrammeSurveysByCourseUnit,
  getOrCreateTeacherSurvey,
}
