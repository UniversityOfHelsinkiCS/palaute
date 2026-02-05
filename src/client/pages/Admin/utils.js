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
