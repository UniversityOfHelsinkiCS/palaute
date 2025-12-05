import {
  sendFeedbackReminderToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
} from './mails'

import { returnEmailsToBeSentToday } from './mails/stats'

import { runContinuousFeedbackCron, runPateCron, scheduleCronJobs } from './scheduleCronJobs'

export const mailer = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
  sendFeedbackReminderToStudents,
  returnEmailsToBeSentToday,
  runContinuousFeedbackCron,
  scheduleCronJobs,
  runPateCron,
}
