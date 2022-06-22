const {
  isSuperAdminIam,
  isAdminIam,
  isUniversityWideIam,
  isDoctoralIam,
  getStudyLeaderGroup,
  iamToOrganisationCode,
  isEmployeeIam,
  iamToDoctoralSchool,
  kosuIamToFaculties,
  dekaaniIamToFaculty,
} = require('../../../config/IAMConfig')
const { data } = require('../../../config/data')
const { mapToDegreeCode } = require('../../../config/common')

/**
 * Return given access to all programmes where predicate is true
 * (all if no predicate defined)
 * @param {object} accessLevel
 * @param {(program: object) => boolean} where
 * @returns {object} access to programmes
 */
const getAllProgrammeAccess = (accessLevel, where) => {
  const access = {}
  data.forEach((faculty) => {
    faculty.programmes.forEach((program) => {
      if (where?.(program) === false) return
      access[program.key] = { ...accessLevel }
    })
  })
  return access
}

/**
 * Grant super-admin rights to the Form if the user has correct iams (eg. grp-toska)
 * @param {string[]} hyGroups
 * @returns superAdmin special group
 */
const getSuperAdmin = (hyGroups) => {
  const isToska = hyGroups.some(isSuperAdminIam)
  if (isToska) {
    return { specialGroup: { superAdmin: true } }
  }
  return {}
}

/**
 * Grant admin rights to the Form if the user has correct iams (eg. grp-ospa)
 * @param {string[]} hyGroups
 * @returns admin special group
 */
const getAdmin = (hyGroups) => {
  const isOspa = hyGroups.some(isAdminIam)
  if (isOspa) {
    return { specialGroup: { admin: true } }
  }
  return {}
}

/**
 * Grant reading rights to all programmes if user has uni wide IAM (eg. hy-rehtoraatti)
 * @param {string[]} hyGroups
 * @returns read access to ALL programmes
 */
const getUniversityReadingRights = (hyGroups) => {
  const hasUniversityReadingRights = hyGroups.some(isUniversityWideIam)
  if (!hasUniversityReadingRights) {
    return {}
  }

  const access = getAllProgrammeAccess({ read: true })
  const specialGroup = { allProgrammes: true }

  return { access, specialGroup }
}

/**
 * Grant reading rights to programmes of faculties if user is kosu or dekaanaatti of some faculties
 * @param {string[]} hyGroups
 */
const getFacultyReadingRights = (hyGroups) => {
  // faculty codes from kosu iam
  const facultyCodes = hyGroups
    .flatMap(kosuIamToFaculties)
    // faculty codes from dekanaatti iam
    .concat(hyGroups.map(dekaaniIamToFaculty).filter(Boolean))

  const access = {}
  facultyCodes.forEach((fc) => {
    const faculty = data.find((faculty) => faculty.code === fc)
    const programmeCodes = faculty.programmes.map((p) => p.key)
    programmeCodes.forEach((code) => {
      access[code] = { read: true }
    })
  })
  return { access, specialGroup: {} }
}

/**
 * Grant reading rights to all doctoral programmes if the user belongs to doctoral IAM
 * @param {string[]} hyGroups
 * @returns read access to ALL doctoral programs
 */
const getDoctoralAccess = (hyGroups) => {
  const hasDoctoralReadingRights = hyGroups.some(isDoctoralIam)
  if (!hasDoctoralReadingRights) return {}
  const access = getAllProgrammeAccess(
    { read: true },
    (program) => program.level === 'doctoral',
  )
  const specialGroup = { doctoral: true }

  return { access, specialGroup }
}

/**
 * Grants reading rights to all doctoral programmes that belong to user's
 * doctoral school IAMs
 * @param {string[]} hyGroups
 * @returns read access to doctoral programs
 */
const getDoctoralSchoolAccess = (hyGroups) => {
  const doctoralProgrammeCodes = hyGroups.flatMap(iamToDoctoralSchool)
  const access = {}
  doctoralProgrammeCodes.forEach((code) => {
    if (!code) return
    access[code] = { read: true }
  })
  return { access }
}

/**
 * Grant admin access if the user belongs to studyprogramme's manager group and is a study program leader
 * @param {string[]} hyGroups
 */
const getProgrammeAdminAccess = (hyGroups) => {
  const orgCodes = hyGroups
    .filter((iam) => hyGroups.includes(getStudyLeaderGroup(iam)))
    .map((iam) => iamToOrganisationCode(iam))
    .filter(Boolean)

  const degreeCodes = orgCodes.flatMap((codes) => codes.map(mapToDegreeCode))

  if (!degreeCodes?.length > 0) {
    return {}
  }

  const access = {}
  degreeCodes.forEach((code) => {
    access[code] = { read: true, write: true, admin: true }
  })
  return { access }
}

/**
 * Grant write and read access if the user belongs to employees group and studyprogramme's manager group
 * @param {string[]} hyGroups
 */
const getProgrammeWriteAccess = (hyGroups) => {
  if (!hyGroups.some(isEmployeeIam)) return {}
  const orgCodes = hyGroups
    .map((iam) => iamToOrganisationCode(iam))
    .filter(Boolean)
  const degreeCodes = orgCodes.flatMap((codes) => codes.map(mapToDegreeCode))
  const access = {}
  degreeCodes.forEach((code) => {
    if (!code) return
    access[code] = { read: true, write: true }
  })

  return { access }
}

/**
 * Grant read access if the user belongs to studyprogramme's manager group
 * @param {string[]} hyGroups
 */
const getProgrammeReadAccess = (hyGroups) => {
  const orgCodes = hyGroups
    .map((iam) => iamToOrganisationCode(iam))
    .filter(Boolean)
  const degreeCodes = orgCodes.flatMap((codes) => codes.map(mapToDegreeCode))
  const access = {}
  degreeCodes.forEach((code) => {
    if (!code) return
    access[code] = { read: true }
  })

  return { access }
}

/**
 * Gets access rights and special groups,
 * based on IAM-groups in IAM header string
 * @param {string} hyGroupsHeader
 */
const getIAMRights = (hyGroups) => {
  let access = {}
  let specialGroup = {}

  ;[
    getUniversityReadingRights,
    getFacultyReadingRights,
    getDoctoralAccess,
    getDoctoralSchoolAccess,
    getProgrammeReadAccess,
    getProgrammeWriteAccess,
    getProgrammeAdminAccess,
    getAdmin,
    getSuperAdmin,
  ]
    .map((f) => f(hyGroups))
    .forEach(({ access: newAccess, specialGroup: newSpecialGroup }) => {
      access = { ...access, ...newAccess }
      specialGroup = { ...specialGroup, ...newSpecialGroup }
    })

  return { access, specialGroup }
}

module.exports = {
  getIAMRights,
}
