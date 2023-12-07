const admin = {
  uid: 'mluukkai',
  givenName: 'Matti',
  mail: 'grp-toska+mockadmin@helsinki.fi',
  sn: 'Luukkainen',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1441871',
  employeeNumber: '9021313',
  hygroupcn: ['hy-employees'],
}

const teacher = {
  uid: 'testiman',
  givenname: 'Tommi',
  sn: 'Testaaja',
  mail: 'Tommi.testaaja@toska.fi',
  preferredlanguage: 'en',
  hyPersonSisuId: 'hy-hlo-51367956',
  employeeNumber: '123445678',
  hygroupcn: ['hy-employees'],
}

const student = {
  uid: 'oppilasolli',
  givenname: 'Olli',
  sn: 'Oppilas',
  mail: 'opiskelija@toska.fi',
  preferredLanguage: ' en',
  hyPersonSisuId: 'hy-hlo-115054920',
}

const studyCoordinator = {
  uid: 'mluukkai',
  givenname: 'Daniel',
  sn: 'Dekaani',
  mail: 'dekaani@toska.fi',
  preferredLanguage: 'en',
  hyPersonSisuId: 'hy-hlo-1501077',
  hygroupcn: ['hy-employees', 'grp-toska'],
}

module.exports = {
  admin,
  teacher,
  student,
  studyCoordinator,
}
