/* eslint-disable */
const request = require('supertest')
const app = require('../index')
const { users } = require('./testutils')

test('Fetching a feedback target as logged in user', async (done) => {
  const response = await request(app)
    .get('/api/feedback-targets/97')
    .set(users.admin)
    .expect(200)
    .expect('Content-type', /application\/json/)

  expect(response.body.typeId).toBe('hy-CUR-137933885')
  expect(response.body.courseUnit.courseCode).toBe('TKT20002')

  done()
})

test('Feedback target can be updated by the teacher', async (done) => {
  const newDate = new Date()

  await request(app)
    .put('/api/feedback-targets/97')
    .send({ opensAt: newDate })
    .set(users.admin)
    .expect(200)

  done()
})

test('Fetching a feedback target without logging in errors', async (done) => {
  const res = await request(app).get('/api/feedback-targets/97').expect(403)

  expect(res.body.error).toBe('Missing uid header')

  done()
})
