import apiClient from '../../util/apiClient'

export const getInitialValues = (survey) => {
  const questions = survey?.questions ?? []

  return {
    questions,
  }
}

export const validate = () => {
  const errors = {}

  return errors
}

export const saveValues = async (values, survey) => {
  const { questions } = values
  const { id } = survey

  const { data } = await apiClient.put(`/surveys/${id}`, { questions })

  return data
}

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

export const getData = (results) => {
  const data = results.map((r) => [
    ...Object.values(r),
    ((r.feedbacks / r.ufbts) * 100).toFixed(2).toString().replace('.', ','),
  ])
  return data
}

export const handleLoginAs = (user) => () => {
  const { id, employeeNumber } = user

  localStorage.setItem('adminLoggedInAs', id)
  localStorage.setItem('employeenumber', employeeNumber ?? null)
  window.location.reload()
}
