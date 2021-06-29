/* eslint-disable */
const request = require('supertest')
const app = require('../index')
const { users } = require('./testutils')

test('User can fetch the university level survey', async () => {
  const res = await request(app)
    .get('/api/surveys/university')
    .set(users.student)
    .expect(200)

  expect(res.body.questionIds.length).toBeGreaterThan(0)
})

test('User with right access can fetch programme level survey', async () => {
  const res = await request(app)
    .get('/api/surveys/programme/500-K005')
    .set(users.studyCoordinator)
    .expect(200)

  expect(res.body.type).toBe('programme')
  expect(res.body.organisation.code).toBe('500-K005')
})
