const { SummaryCustomisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const parseBody = body => {
  const { customisation } = body
  if (!customisation) {
    throw new ApplicationError('Body is missing customisation', 400)
  }

  const { hiddenRows } = customisation
  if (!Array.isArray(hiddenRows)) {
    throw new ApplicationError('customisation is missing hiddenRows', 400)
  }

  return {
    hiddenRows,
  }
}

const updateCustomisation = async (req, res) => {
  const { user } = req
  const data = parseBody(req.body)
  let customisation = await user.getSummaryCustomisation()

  if (!customisation) {
    customisation = await SummaryCustomisation.create({
      userId: user.id,
      data,
    })
  } else {
    customisation.data = data
    await customisation.save()
  }

  return res.send(customisation)
}

const getCustomisation = async (req, res) => {
  const { user } = req
  const customisation = await user.getSummaryCustomisation()
  return res.send(customisation)
}

module.exports = {
  updateCustomisation,
  getCustomisation,
}
