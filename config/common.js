const mapToDegreeCode = (organisationCode) => {
  if (!organisationCode) return ''
  if (organisationCode.length < 7) return ''
  const doctoral = organisationCode[0] === 'T'
  if (doctoral) {
    return organisationCode
  }

  const [start, end] = organisationCode.split('-')
  if (end && end.length < 3) return ''
  if (start.length < 2) return ''
  const masters = end[0] === 'M'
  const code = `${masters ? 'M' : 'K'}H${start.substr(0, 2)}_${end.substr(-3)}`
  return code
}

module.exports = {
  mapToDegreeCode,
}
