/* eslint-disable */
const request = require('supertest')
const app = require('../index')

const headers = {
  uid: 'mluukkai',
  givenName: 'Matti',
  mail: 'grp-toska+mockadmin@helsinki.fi',
  sn: 'Luukkainen',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1441871',
  employeeNumber: '9021313',
}

test('Fetching a feedback target as logged in user', async (done) => {
  const response = await request(app)
    .get('/api/feedback-targets/97')
    .set(headers)
    .expect(200)
    .expect('Content-type', /application\/json/)

  expect(response.body.typeId).toBe('hy-CUR-137933885')
  expect(response.body.courseUnit.courseCode).toBe('TKT20002')

  done()
})
