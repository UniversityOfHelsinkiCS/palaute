const createTestObject = async (Model, data) => {
  const oldInstance = await Model.findOne({
    where: data,
  })

  if (oldInstance) {
    console.log('Object already exists', oldInstance.toJSON())
    return oldInstance
  }

  return Model.create(data)
}

const clearTestObject = (Model, where) => {
  const instance = Model.findOne({
    where,
  })

  if (!instance) {
    console.warn('Object not found', where)
  }

  return Model.destroy({
    where,
    logging: console.log,
  })
}

module.exports = {
  createTestObject,
  clearTestObject,
}
