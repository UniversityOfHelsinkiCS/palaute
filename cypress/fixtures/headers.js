const admin = {
  uid: 'mluukkai',
  givenname: 'Matti',
  mail: 'grp-toska+mockadmin@helsinki.fi',
  sn: 'Luukkainen',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-1441871',
  hygroupcn: ['hy-employees'],
}

const teacher = {
  uid: 'testiman',
  givenname: 'Tommi',
  sn: 'Testaaja',
  mail: 'Tommi.testaaja@toska.fi',
  preferredlanguage: 'en',
  hyPersonSisuId: 'test-hlo-51367956',
  hygroupcn: ['hy-employees'],
}

const student = {
  uid: 'oppilasolli',
  givenname: 'Olli',
  sn: 'Oppilas',
  mail: 'opiskelija@toska.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-115054920',
  studentNumber: '010000001',
}

const studentHenri = {
  uid: 'studhenri',
  givenname: 'Henri',
  sn: 'Testaaja',
  mail: 'henri.testaaja@helsinki.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-124043339',
  studentNumber: '010000002',
}

const studentMiko = {
  uid: 'studkemi',
  givenname: 'Miko',
  sn: 'Testaaja',
  mail: 'miko.testaaja@helsinki.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-136095188',
  studentNumber: '010000003',
}

const studentVeikko = {
  uid: 'studvesu',
  givenname: 'Veikko',
  sn: 'Testaaja',
  mail: 'veikko.testaaja@helsinki.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-130991964',
  studentNumber: '010000004',
}

const studentRandom = {
  uid: 'studrandom',
  givenname: 'Random',
  sn: 'Testaaja',
  mail: 'random.testaaja@helsinki.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-111111111',
  studentNumber: '010000005',
}

const organisationCorrespondent = {
  uid: 'orgcscorrespondent',
  givenname: 'Correspondent',
  sn: 'Tester',
  mail: 'cs.correspondent@helsinki.fi',
  preferredLanguage: 'en ',
  hyPersonSisuId: 'test-hlo-111111112',
  hygroupcn: ['hy-employees'],
  studentNumber: '010000006',
}

const summaryUser = {
  uid: 'summary-user',
  givenname: 'Summary',
  sn: 'mc Summaryface',
  mail: 'asd.asd@helsinki.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'test-hlo-111111113',
  hygroupcn: ['hy-employees'],
}

const getFullName = user => `${user.givenname} ${user.sn}`

const testUsers = [
  admin,
  teacher,
  student,
  studentHenri,
  studentMiko,
  studentVeikko,
  studentRandom,
  organisationCorrespondent,
  summaryUser,
]

module.exports = {
  admin,
  teacher,
  student,
  studentHenri,
  studentMiko,
  studentVeikko,
  studentRandom,
  organisationCorrespondent,
  summaryUser,
  testUsers,
  getFullName,
}
