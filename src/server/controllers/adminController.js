const Router = require('express')

const { ApplicationError } = require('../util/customErrors')
const importerClient = require('../util/importerClient')
const { ADMINS } = require('../util/config')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers
  if (!ADMINS.includes(username)) throw new ApplicationError('Forbidden', 403)

  return next()
}

const findUser = async (req, res) => {
  const {
    query: { user },
  } = req

  const isEmployeeNumber = !Number.isNaN(Number(user)) && user.charAt(0) !== '0'
  const isStudentNumber = !isEmployeeNumber && !Number.isNaN(Number(user))
  const isSisuId =
    !isEmployeeNumber &&
    !isStudentNumber &&
    !Number.isNaN(Number(user[user.length - 1]))
  const isUsername = !isStudentNumber && !isSisuId && !isEmployeeNumber

  const params = {}

  if (isStudentNumber) params.studentNumber = user
  if (isSisuId) params.id = user
  if (isEmployeeNumber) params.employeeNumber = user
  if (isUsername) params.eduPersonPrincipalName = user

  const { data } = await importerClient.get(`/palaute/persons`, { params })
  const { persons } = data

  res.send({
    params,
    persons,
  })
}

const router = Router()

router.use(adminAccess)

router.get('/users', findUser)

module.exports = router
