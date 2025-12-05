import { subDays, addDays, format } from 'date-fns'
import _ from 'lodash'
import { QueryTypes } from 'sequelize'
import { sequelize } from '../../db/dbConnection'

import { createRecipientsForFeedbackTargets } from './util'

import {
  getFeedbackTargetsAboutToOpenForTeachers,
  emailReminderAboutSurveyOpeningToTeachers,
} from './sendEmailReminderAboutSurveyOpeningToTeachers'

import {
  getFeedbackTargetsWithoutResponseForTeachers,
  emailReminderAboutFeedbackResponseToTeachers,
} from './sendEmailReminderAboutFeedbackResponseToTeacher'

import {
  getOpenFeedbackTargetsForStudents,
  notificationAboutSurveyOpeningToStudents,
} from './sendEmailAboutSurveyOpeningToStudents'

const getStudentEmailCounts = async () => {
  const studentEmailCounts = await sequelize.query<{
    opens_at: Date
    count: string
  }>(
    `SELECT f.opens_at, count(DISTINCT us.id) FROM feedback_targets f
        INNER JOIN user_feedback_targets u on u.feedback_target_id = f.id
        INNER JOIN course_realisations c on c.id = f.course_realisation_id
        INNER JOIN users us on us.id = u.user_id
        WHERE f.opens_at > :opensAtLow and f.opens_at < :opensAtHigh 
          AND u.access_status = 'STUDENT' 
          AND f.feedback_type = 'courseRealisation'
          AND f.hidden = false
          AND c.start_date > '2021-8-1 00:00:00+00'
          AND u.feedback_open_email_sent = false
        GROUP BY f.opens_at`,
    {
      replacements: {
        opensAtLow: subDays(new Date(), 1),
        opensAtHigh: addDays(new Date(), 28),
      },
      type: QueryTypes.SELECT,
    }
  )

  const groupedEmailCounts = _.groupBy(studentEmailCounts, obj => format(obj.opens_at, 'dd.MM.yyyy'))

  const finalEmailCounts = Object.keys(groupedEmailCounts).map(key =>
    groupedEmailCounts[key].length > 1
      ? {
          date: key,
          count: groupedEmailCounts[key].reduce((sum, obj) => sum + parseInt(obj.count, 10), 0),
        }
      : { date: key, count: parseInt(groupedEmailCounts[key][0].count, 10) }
  )
  return finalEmailCounts
}

const getTeacherEmailCounts = async () => {
  const teacherEmailCounts = await sequelize.query<{
    opens_at: Date
    count: string
  }>(
    `SELECT f.opens_at, count(DISTINCT us.id) FROM feedback_targets f
        INNER JOIN user_feedback_targets u on u.feedback_target_id = f.id
        INNER JOIN course_realisations c on c.id = f.course_realisation_id
        INNER JOIN users us on us.id = u.user_id
        WHERE f.opens_at > :opensAtLow and f.opens_at < :opensAtHigh 
          AND is_teacher(u.access_status)
          AND f.feedback_type = 'courseRealisation'
          AND f.feedback_opening_reminder_email_sent = false
          AND f.hidden = false
          AND c.start_date > '2021-8-1 00:00:00+00'
        GROUP BY f.opens_at`,
    {
      replacements: {
        opensAtLow: addDays(new Date(), 6),
        opensAtHigh: addDays(new Date(), 35),
      },
      type: QueryTypes.SELECT,
    }
  )

  const groupedEmailCounts = _.groupBy(teacherEmailCounts, obj => format(subDays(obj.opens_at, 7), 'dd.MM.yyyy'))

  const finalEmailCounts = Object.keys(groupedEmailCounts).map(key =>
    groupedEmailCounts[key].length > 1
      ? {
          date: key,
          count: groupedEmailCounts[key].reduce((sum, obj) => sum + parseInt(obj.count, 10), 0),
        }
      : { date: key, count: parseInt(groupedEmailCounts[key][0].count, 10) }
  )

  return finalEmailCounts
}

export const returnEmailsToBeSentToday = async () => {
  const studentFeedbackTargets = await getOpenFeedbackTargetsForStudents()
  const teacherFeedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teacherEmailCountFor7Days = await getTeacherEmailCounts()
  const studentEmailCountFor7Days = await getStudentEmailCounts()

  const studentsWithFeedbackTargets = await createRecipientsForFeedbackTargets(studentFeedbackTargets, {
    whereOpenEmailNotSent: true,
    primaryOnly: false,
  })

  const teachersWithFeedbackTargets = await createRecipientsForFeedbackTargets(teacherFeedbackTargets, {
    primaryOnly: true,
    whereOpenEmailNotSent: false,
  })

  const studentEmailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(student =>
    notificationAboutSurveyOpeningToStudents(student, studentsWithFeedbackTargets[student])
  )

  const teacherSurveyReminderEmails = Object.keys(teachersWithFeedbackTargets).map(teacher =>
    emailReminderAboutSurveyOpeningToTeachers(teacher, teachersWithFeedbackTargets[teacher])
  )

  const teacherReminderFeedbackTargets = await getFeedbackTargetsWithoutResponseForTeachers()
  const teacherFeedbackReminderEmails = teacherReminderFeedbackTargets.flatMap(fbt =>
    fbt.users.map(user => emailReminderAboutFeedbackResponseToTeachers(user, fbt, fbt.users))
  )

  const teacherEmailsToBeSent = [...teacherSurveyReminderEmails, ...teacherFeedbackReminderEmails]

  return {
    students: studentEmailsToBeSent,
    teachers: teacherEmailsToBeSent,
    teacherEmailCounts: teacherEmailCountFor7Days,
    studentEmailCounts: studentEmailCountFor7Days,
  }
}
