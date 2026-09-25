import type { Page } from '@playwright/test'

import type { FeedbackTarget } from '../support/api'

import {
  admin,
  getFullName,
  organisationCorrespondent,
  student,
  studentHenri,
  studentMiko,
  studentRandom,
  studentVeikko,
  teacher,
} from '../fixtures/headers'
import { addSurveyQuestions, byDataCy, contains, expect, test, textField } from '../support/test'

const surveyBody = (overrides: Record<string, unknown> = {}) => {
  const today = new Date()
  return {
    name: { fi: 'Uusi kysely', en: 'New survey', sv: '' },
    studentNumbers: [],
    teacherIds: [teacher.hyPersonSisuId],
    startDate: today,
    endDate: new Date().setDate(today.getDate() + 1),
    ...overrides,
  }
}

const teacherOption = (page: Page, name: string) =>
  contains(page, name, '.MuiAutocomplete-popper [role="listbox"] [role="option"]')

const addTeacher = async (page: Page, query: string, name: string) => {
  await textField(page, 'formik-responsible-teacher-input-field').fill(query)
  await teacherOption(page, name).click()
}

const addStudent = async (page: Page, studentNumber: string) => {
  await textField(page, 'formik-student-number-input-field').pressSequentially(studentNumber)
  await textField(page, 'formik-student-number-input-field').press('Enter')
  await expect(byDataCy(page, `formik-student-number-input-field-chip-${studentNumber}`)).toBeAttached()
}

const saveSurvey = async (page: Page) => {
  await byDataCy(page, 'organisation-survey-editor-save').click()
  await expect(byDataCy(page, 'organisation-survey-editor-save')).not.toBeAttached()
}

// Matches the survey with the given id, or any survey when no id is given
const surveyItem = (page: Page, part: string, id?: number) =>
  id
    ? page.locator(`[data-cy="organisation-survey-${part}-${id}"]`)
    : page.locator(`[data-cy^="organisation-survey-${part}-"]`).first()

const expectResponsiblePersons = async (page: Page, names: string[], notNames: string[] = [], id?: number) => {
  const persons = surveyItem(page, 'responsible-persons', id)
  await expect(persons.locator(':scope > .MuiChip-root')).toHaveCount(names.length)
  for (const name of names) await expect(persons).toContainText(name)
  for (const name of notNames) await expect(persons).not.toContainText(name)
}

const openSurveyFromCourses = async (page: Page, surveyId: number) => {
  await page.goto(`/courses`)
  await expect(byDataCy(page, 'course-unit-group-title-Organisation surveys')).toBeAttached()
  await byDataCy(page, 'my-teaching-course-unit-item-TEST_ORG-SRV').click()
  await byDataCy(page, `my-teaching-feedback-target-item-link-${surveyId}`).click()
}

const expectSurveyPage = async (page: Page, feedbackCount: string, hasOrganisationLink: boolean) => {
  await expect(byDataCy(page, 'feedback-target-primary-course-name')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-secondary-course-name')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-feedback-dates')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-edit-organisation-survey')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-feedback-count')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-feedback-count-percentage')).toContainText(feedbackCount)

  await expect(byDataCy(page, 'feedback-target-responsible-administrative-person-list')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-responsible-teacher-list')).not.toBeAttached()
  await expect(byDataCy(page, 'feedback-target-teacher-list')).not.toBeAttached()

  await expect(byDataCy(page, 'feedback-target-copy-student-link')).toBeAttached()
  if (hasOrganisationLink) {
    await expect(byDataCy(page, 'feedback-target-organisation-link')).toBeAttached()
  } else {
    await expect(byDataCy(page, 'feedback-target-organisation-link')).not.toBeAttached()
  }
  await expect(byDataCy(page, 'feedback-target-course-summary-link')).not.toBeAttached()
  await expect(byDataCy(page, 'feedback-target-course-page-link')).not.toBeAttached()
  await expect(byDataCy(page, 'feedback-target-wiki-link')).toBeAttached()
  await expect(byDataCy(page, 'feedback-target-sisu-page-link')).not.toBeAttached()
  await expect(byDataCy(page, 'feedback-target-interim-feedback-parent-link')).not.toBeAttached()

  await byDataCy(page, 'feedback-target-give-feedback-tab').click()
  await expectQuestionsTabDisabled(page)
  await byDataCy(page, 'feedback-target-share-feedback-tab').click()
  await byDataCy(page, 'feedback-target-results-tab').click()
  await byDataCy(page, 'feedback-target-students-with-feedback-tab').click()
}

const expectQuestionsTabDisabled = async (page: Page) => {
  await expect(
    page
      .locator('[aria-label="Questions tab disabled: Survey can no longer be edited after the feedback has opened."]')
      .first()
  ).toBeAttached()
}

const expectNoFeedbackItem = async (page: Page, surveyId: number, tab: string) => {
  await byDataCy(page, `my-feedbacks-${tab}-tab`).click()
  await expect(byDataCy(page, `feedback-item-${surveyId}`)).not.toBeAttached()
  await expect(byDataCy(page, 'my-feedbacks-no-feedbacks')).toBeAttached()
}

test.describe('Feedback Correspondents', () => {
  test.beforeEach(async ({ api, loginAs }) => {
    // The teacher search only lists users whose IAM groups Jami knows
    await api.login(teacher)
    await api.seedTestOrgCorrespondent(organisationCorrespondent)
    await loginAs(organisationCorrespondent)
  })

  test('can visit organisation survey page', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/settings`)
    await contains(page, 'Programme surveys').click()

    await expect(byDataCy(page, 'organisation-surveys-add-new')).toBeVisible()
    await expect(byDataCy(page, 'organisation-surveys-no-surveys-alert')).toBeVisible()
  })

  test('can access new survey window and the form is rendered correctly', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await byDataCy(page, 'organisation-surveys-add-new').click()

    await expect(byDataCy(page, 'organisation-surveys-add-new')).toBeDisabled()
    await expect(byDataCy(page, 'organisation-surveys-editor-title')).toBeVisible()

    await expect(byDataCy(page, 'formik-locales-field-fi-name')).toBeVisible()
    await expect(byDataCy(page, 'formik-locales-field-sv-name')).toBeVisible()
    await expect(byDataCy(page, 'formik-locales-field-en-name')).toBeVisible()
    await expect(byDataCy(page, 'formik-date-picker-field-startDate')).toBeVisible()
    await expect(byDataCy(page, 'formik-date-picker-field-endDate')).toBeVisible()
    await expect(byDataCy(page, 'formik-responsible-teacher-input-field')).toBeVisible()

    await expect(byDataCy(page, 'formik-student-number-input-alert')).toBeVisible()
    await expect(byDataCy(page, 'formik-student-number-input-expand-button')).toBeVisible()
    await expect(byDataCy(page, 'formik-student-number-input-delimeter-list')).not.toBeAttached()
    await expect(byDataCy(page, 'formik-student-number-input-example')).not.toBeAttached()
    await expect(byDataCy(page, 'formik-student-number-input-field')).toBeVisible()

    await byDataCy(page, 'formik-student-number-input-expand-button').click()
    await expect(byDataCy(page, 'formik-student-number-input-delimeter-list')).toBeVisible()
    await expect(byDataCy(page, 'formik-student-number-input-example')).toBeVisible()

    await expect(byDataCy(page, 'organisation-survey-editor-save')).toBeVisible()
    await expect(byDataCy(page, 'organisation-survey-editor-cancel')).toBeVisible()
    await expect(byDataCy(page, 'organisation-survey-editor-save')).toBeEnabled()
  })

  test('can fill in new organisation surveys', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await byDataCy(page, 'organisation-surveys-add-new').click()

    await textField(page, 'formik-locales-field-fi-name').fill('Testi kysely')
    await textField(page, 'formik-locales-field-sv-name').fill('Testundersökning')
    await textField(page, 'formik-locales-field-en-name').fill('Test survey')

    await expect(byDataCy(page, 'formik-date-picker-field-startDate')).toBeVisible()
    await expect(byDataCy(page, 'formik-date-picker-field-endDate')).toBeVisible()
    await expect(byDataCy(page, 'formik-responsible-teacher-input-field')).toBeVisible()
    await expect(byDataCy(page, 'formik-student-number-input-field')).toBeVisible()

    // The logged in user is the responsible teacher by default
    const teacherChips = byDataCy(page, 'formik-responsible-teacher-input-field-chip')
    await expect(teacherChips).toHaveAttribute('data-tag-index', '0')
    await expect(teacherChips).toHaveText('Correspondent Tester (cs.correspondent@helsinki.fi)')

    await addTeacher(page, 'Tommi Testaaja', 'Tommi Testaaja')
    await expect(teacherChips.and(page.locator('[data-tag-index="0"]'))).toContainText('Correspondent Tester')
    await expect(teacherChips.and(page.locator('[data-tag-index="1"]'))).toContainText('Tommi Testaaja')

    // Student numbers are separated by enter, space, semicolon or comma
    const studentInput = textField(page, 'formik-student-number-input-field')
    await studentInput.pressSequentially('010000001')
    await studentInput.press('Enter')
    await studentInput.pressSequentially('010000002 ')
    await studentInput.pressSequentially('010000003;')
    await studentInput.pressSequentially('010000004,')

    for (const studentNumber of ['010000001', '010000002', '010000003', '010000004']) {
      await expect(byDataCy(page, `formik-student-number-input-field-chip-${studentNumber}`)).toBeAttached()
    }

    await saveSurvey(page)
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)

    // The id of the created survey is unknown, so match any survey
    await expect(surveyItem(page, 'item-title')).toBeAttached()
    await expect(surveyItem(page, 'not-open')).toBeAttached()
    await expect(surveyItem(page, 'period-info')).toBeAttached()
    await expect(surveyItem(page, 'feedback-count')).toBeAttached()
    await expect(surveyItem(page, 'feedback-count-percentage')).toContainText('0/4')
    await expect(surveyItem(page, 'responsible-persons').locator(':scope > .MuiChip-root')).toHaveCount(2)

    await expect(surveyItem(page, 'show-feedback')).toBeAttached()
    await expect(surveyItem(page, 'show-results')).not.toBeAttached()
    await expect(surveyItem(page, 'delete')).toBeAttached()
  })

  test('can not create survey with validation errors', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)

    await byDataCy(page, 'organisation-surveys-add-new').click()
    await byDataCy(page, 'organisation-survey-editor-save').click()

    for (const language of ['fi', 'sv', 'en']) {
      await expect(
        contains(byDataCy(page, `formik-locales-field-${language}-name`), 'This field is required', 'p')
      ).toBeAttached()
    }

    // The logged in user can't be a student of their own survey
    await textField(page, 'formik-locales-field-en-name').fill('Test survey')
    await addStudent(page, '010000006')
    await byDataCy(page, 'organisation-survey-editor-save').click()

    const studentInput = byDataCy(page, 'formik-student-number-input-field')
    await expect(contains(studentInput, 'Responsible person can not be a student at the same time', 'p')).toBeAttached()

    // A student can't be added as a responsible teacher
    await textField(page, 'formik-responsible-teacher-input-field').fill('henri.testaaja@helsinki.fi')
    await expect(page.locator('.MuiAutocomplete-popper [role="listbox"] [role="option"]')).toHaveCount(0)

    // Invalid student numbers are rejected
    const cancelIcon = byDataCy(page, 'formik-student-number-input-field-chip-010000006').locator(
      '[data-testid="CancelIcon"]'
    )
    await expect(cancelIcon).toBeVisible()
    await cancelIcon.click()

    await textField(page, 'formik-student-number-input-field').clear()
    await addStudent(page, '0148959')
    await byDataCy(page, 'organisation-survey-editor-save').click()

    await expect(contains(studentInput, 'Please check the indicated invalid student numbers', 'p')).toBeAttached()
  })

  test('can edit organisation surveys', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)

    // Create a survey with just a name
    await byDataCy(page, 'organisation-surveys-add-new').click()
    await textField(page, 'formik-locales-field-en-name').fill('Test survey')
    await saveSurvey(page)
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)

    await expect(surveyItem(page, 'item-title')).toBeAttached()
    await expect(surveyItem(page, 'feedback-count-percentage')).toContainText('0/0')
    await expectResponsiblePersons(page, ['Correspondent Tester'], ['Tommi Testaaja'])

    // Add a teacher and students
    await surveyItem(page, 'show-feedback').click()
    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()
    await addTeacher(page, 'Tommi Testaaja', 'Tommi Testaaja')
    await addStudent(page, '010000001')
    await addStudent(page, '010000002')
    await saveSurvey(page)

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'item-title')).toContainText('Test survey')
    await expect(surveyItem(page, 'feedback-count-percentage')).toContainText('0/2')
    await expectResponsiblePersons(page, ['Correspondent Tester', 'Tommi Testaaja'])

    // Change the name
    await surveyItem(page, 'show-feedback').click()
    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()
    await textField(page, 'formik-locales-field-en-name').fill('Greatest survey of them all!')
    await saveSurvey(page)

    // Only the name changed
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'item-title')).not.toContainText('Test survey')
    await expect(surveyItem(page, 'item-title')).toContainText('Greatest survey of them all!')
    await expect(surveyItem(page, 'feedback-count-percentage')).toContainText('0/2')
    await expectResponsiblePersons(page, ['Correspondent Tester', 'Tommi Testaaja'])
  })

  test('can edit organisation surveys after feedback period has started', async ({ page, api }) => {
    const survey = await api.createOrganisationSurvey('TEST_ORG', surveyBody())

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'item-title', survey.id)).toBeAttached()
    await expectResponsiblePersons(page, [getFullName(teacher)], [getFullName(admin)], survey.id)

    await surveyItem(page, 'show-feedback', survey.id).click()
    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()

    await addTeacher(page, organisationCorrespondent.mail, getFullName(organisationCorrespondent))
    await addStudent(page, student.studentNumber!)
    await saveSurvey(page)

    await api.giveOrganisationSurveyFeedback(survey, student)

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'item-title', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'feedback-count-percentage', survey.id)).toContainText('1/1')
    await expectResponsiblePersons(page, [getFullName(teacher), getFullName(organisationCorrespondent)], [], survey.id)
  })

  test('can not delete organisation surveys after feedback has been given', async ({ page, api }) => {
    const survey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({ studentNumbers: [student.studentNumber] })
    )
    await api.giveOrganisationSurveyFeedback(survey, student)

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'show-feedback', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'show-results', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'delete', survey.id)).not.toBeAttached()
  })

  test('can view own organisations organisation surveys', async ({ page, api }) => {
    const survey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({
        studentNumbers: [student.studentNumber],
        teacherIds: [organisationCorrespondent.hyPersonSisuId],
      })
    )
    await api.giveOrganisationSurveyFeedback(survey, student)

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await surveyItem(page, 'show-feedback', survey.id).click()

    await expectSurveyPage(page, '1/1', true)
  })

  test('can create questions for organisation survey', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)

    await byDataCy(page, 'organisation-surveys-add-new').click()
    await textField(page, 'formik-locales-field-en-name').fill('Test survey')
    await addStudent(page, studentHenri.studentNumber!)
    await saveSurvey(page)

    await addSurveyQuestions(page)
  })

  test('can add students from courses and from student field and delete the course afterwards', async ({
    page,
    api,
  }) => {
    await api.createFeedbackTarget({ extraStudents: 9 })
    const survey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({
        name: { fi: 'Uusi kysely', en: 'New survey', sv: 'Katten i vatten' },
        studentNumbers: [student.studentNumber],
        teacherIds: [organisationCorrespondent.hyPersonSisuId],
        courseRealisationIds: ['norppa-test-course-unit-realisation-id-2'],
      })
    )

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await surveyItem(page, 'show-feedback', survey.id).click()

    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()
    await addStudent(page, studentHenri.studentNumber!)
    await saveSurvey(page)

    await byDataCy(page, 'feedback-target-students-with-feedback-tab').click()
    await expect(contains(page, 'henri.testaaja@helsinki.fi')).toBeAttached()

    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()
    await byDataCy(page, 'formik-course-input-field-chip-norppa-test-course-unit-realisation-id-2')
      .locator('[data-testid="CancelIcon"]')
      .click()
    await saveSurvey(page)

    await byDataCy(page, 'feedback-target-results-tab').click()
    await byDataCy(page, 'feedback-target-students-with-feedback-tab').click()
    await expect(contains(page, 'henri.testaaja@helsinki.fi')).toBeAttached()
    await expect(contains(page, 'opiskelija@toska.fi')).not.toBeAttached()
  })
})

test.describe('Responsible Teachers', () => {
  let survey: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    await api.seedTestOrgCorrespondent(organisationCorrespondent)
    const today = new Date()
    survey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({ endDate: new Date().setDate(today.getDate() + 7) })
    )
    await loginAs(teacher)
  })

  test('can view own organisation surveys if responsible teacher', async ({ page }) => {
    await openSurveyFromCourses(page, survey.id)
    await expect(page).toHaveURL(/\/feedback/)

    await expectSurveyPage(page, '0/0', false)
  })

  test('can edit organisation surveys', async ({ page, loginAs }) => {
    await openSurveyFromCourses(page, survey.id)
    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()

    await addTeacher(page, 'Matti Luukkainen', 'Matti Luukkainen')
    await addStudent(page, student.studentNumber!)
    await addStudent(page, studentHenri.studentNumber!)
    await saveSurvey(page)

    await loginAs(organisationCorrespondent)
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(surveyItem(page, 'item-title', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'feedback-count-percentage', survey.id)).toContainText('0/2')
    await expectResponsiblePersons(page, ['Matti Luukkainen', 'Tommi Testaaja'], [], survey.id)
  })

  test('can not create/edit questions for ongoing organistaion survey', async ({ page }) => {
    await openSurveyFromCourses(page, survey.id)
    await expectQuestionsTabDisabled(page)
  })

  test('can create questions for organisation survey', async ({ page, api }) => {
    const today = new Date()
    const upcomingSurvey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({
        name: { fi: 'Uusin kysely', en: 'Newest survey', sv: '' },
        startDate: new Date().setDate(today.getDate() + 1),
        endDate: new Date().setDate(today.getDate() + 7),
      })
    )

    await page.goto(`/courses`)
    await byDataCy(page, 'my-teaching-upcoming-tab').click()
    await expect(byDataCy(page, 'course-unit-group-title-Organisation surveys')).toBeAttached()
    await byDataCy(page, 'my-teaching-course-unit-accordion-TEST_ORG-SRV').click()
    await byDataCy(page, `my-teaching-feedback-target-item-link-${upcomingSurvey.id}`).click()

    await byDataCy(page, 'feedback-target-settings-tab').click()
    await addSurveyQuestions(page)
  })

  test('can add students after creation and student count increases', async ({ page }) => {
    await openSurveyFromCourses(page, survey.id)
    await byDataCy(page, 'feedback-target-edit-organisation-survey').click()

    await addStudent(page, student.studentNumber!)
    await byDataCy(page, 'organisation-survey-editor-save').click()

    await expect(byDataCy(page, 'feedback-target-feedback-count-percentage')).toContainText('0/1')
  })
})

test.describe('Students', () => {
  let survey: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    await api.seedTestOrgCorrespondent(organisationCorrespondent)
    const today = new Date()
    survey = await api.createOrganisationSurvey(
      'TEST_ORG',
      surveyBody({
        studentNumbers: [student, studentHenri, studentMiko, studentVeikko, studentRandom].map(s => s.studentNumber),
        endDate: new Date().setDate(today.getDate() + 7),
      })
    )
    await loginAs(studentHenri)
  })

  test('can view ongoing organisation surveys and give organisation survey feedback', async ({ page }) => {
    await page.goto(`/feedbacks`)
    await expect(byDataCy(page, `feedback-item-${survey.id}`)).toBeAttached()
    await byDataCy(page, 'feedback-item-give-feedback').click()

    await expect(byDataCy(page, 'feedback-target-edit-organisation-survey')).not.toBeAttached()

    await byDataCy(page, 'feedback-target-give-feedback-tab').click()
    await expect(byDataCy(page, 'feedback-target-results-tab')).not.toBeAttached()

    await byDataCy(page, 'feedback-view-give-feedback').click()
    await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()
    await expect(byDataCy(page, 'feedback-target-results-feedback-chart')).toBeAttached()
    await expect(page).toHaveURL(/\/results/)

    // Edit answer
    await byDataCy(page, 'feedback-target-edit-feedback-tab').click()
    await byDataCy(page, 'feedback-view-give-feedback').click()
    await expect(contains(page, 'Feedback has been given. Thank you for your feedback!')).toBeAttached()
    await expect(page).toHaveURL(/\/results/)

    await page.goto(`/feedbacks`)
    await expectNoFeedbackItem(page, survey.id, 'waiting')

    await byDataCy(page, 'my-feedbacks-given-tab').click()
    await expect(byDataCy(page, `feedback-item-${survey.id}`)).toBeAttached()
    await expect(byDataCy(page, 'my-feedbacks-no-feedbacks')).not.toBeAttached()
  })
})

test.describe('Admin Users', () => {
  let survey: FeedbackTarget

  test.beforeEach(async ({ api, loginAs }) => {
    survey = await api.createOrganisationSurvey('TEST_ORG', surveyBody({ studentNumbers: [student.studentNumber] }))
    await loginAs(admin)
  })

  test('can create questions for organisation survey regardles of ongoing feedback', async ({ page }) => {
    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await surveyItem(page, 'show-feedback', survey.id).click()

    await byDataCy(page, 'feedback-target-settings-tab').click()
    await addSurveyQuestions(page)
  })

  test('can delete organisation surveys after feedback has been given', async ({ page, api, loginAs }) => {
    await api.giveOrganisationSurveyFeedback(survey, student)

    await page.goto(`/organisations/TEST_ORG/organisation-surveys`)
    await expect(byDataCy(page, 'organisation-surveys-no-surveys-alert')).not.toBeAttached()

    await expect(surveyItem(page, 'show-feedback', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'show-results', survey.id)).toBeAttached()
    await expect(surveyItem(page, 'feedback-count-percentage', survey.id)).toContainText('1/1')

    const confirmMessages: string[] = []
    page.on('dialog', dialog => confirmMessages.push(dialog.message()))
    await surveyItem(page, 'delete', survey.id).click()
    await expect(surveyItem(page, 'show-feedback', survey.id)).not.toBeAttached()
    expect(confirmMessages).toEqual(['Are you sure you want to remove this programme survey?'])

    await expect(byDataCy(page, 'organisation-surveys-no-surveys-alert')).toBeVisible()

    // The survey is also gone from the student's page
    await loginAs(student)
    await page.goto(`/feedbacks`)
    await expectNoFeedbackItem(page, survey.id, 'waiting')
    await expectNoFeedbackItem(page, survey.id, 'given')
    await expectNoFeedbackItem(page, survey.id, 'closed')
  })
})
