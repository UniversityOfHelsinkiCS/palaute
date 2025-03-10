import { normalizeOrganisationCode } from '../../util/normaliseOrganisationCode'

export const getHeaders = () => [
  'Id',
  'Opiskelijat',
  'Palautteet',
  'Kurssin nimi',
  'Kurssikoodi',
  'Kurssi alkaa',
  'Kurssi päättyy',
  'Vastapalaute',
  'Koulutusohjelma',
  'Koulutusohjelman koodi',
  'Tiedekunta',
  'Palaute %',
]

export const getData = results => {
  const data = results.map(r => [
    ...Object.values(r),
    ((r.feedbacks / r.ufbts) * 100).toFixed(2).toString().replace('.', ','),
  ])
  return data
}

export const handleLoginAs = user => () => {
  const { id } = user

  localStorage.setItem('adminLoggedInAs', id)
  window.location.reload()
}

export const getFaculties = data => {
  const faculties = data.map(({ code, name }) => ({ code, name }))

  return faculties
}

const getProgrammeAccess = (users, key) => {
  const usersWithAccessToProgramme = users
    .map(user => ({
      ...user,
      access: user.access.filter(({ organisation }) => organisation.code === key),
    }))
    .filter(({ access }) => access.length)

  return usersWithAccessToProgramme
}

export const getProgrammeAccessByFaculty = (usersWithAccess, facultyCode, data) => {
  const faculty = data.find(({ code }) => code === facultyCode)

  const programmes = faculty
    ? faculty.programmes.map(({ key, name }) => ({
        key: normalizeOrganisationCode(key),
        name,
      }))
    : data
        .flatMap(({ programmes }) => programmes)
        .map(({ key, name }) => ({ name, key: normalizeOrganisationCode(key) }))

  const programmeCodes = programmes.map(({ key }) => key)

  const usersWithAccessToFaculty = usersWithAccess
    .map(user => ({
      ...user,
      access: user.access.filter(({ organisation }) => programmeCodes.includes(organisation.code)),
    }))
    .filter(({ access }) => access.length)

  const programmesWithAccess = programmes.map(({ key, name }) => ({
    key,
    name,
    access: getProgrammeAccess(usersWithAccessToFaculty, key),
  }))

  return programmesWithAccess
}
