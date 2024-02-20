const createTestObject = async (Model, data) => {
  const oldInstance = await Model.findOne({
    where: data.id
      ? {
          id: data.id,
        }
      : data,
  })

  if (oldInstance) {
    console.log('Object already exists', oldInstance.toJSON())
    return oldInstance
  }

  return Model.create(data, {
    hooks: false,
  })
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
    hooks: false,
  })
}

module.exports = {
  createTestObject,
  clearTestObject,
}
