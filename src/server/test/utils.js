const createTestObject = async (Model, data) => {
  const oldInstance = await Model.findOne({
    where: data.id
      ? {
          id: data.id,
        }
      : data,
  })

  if (oldInstance) {
    /* eslint-disable no-console */
    console.log('Object already exists', oldInstance.toJSON())
    return oldInstance
  }

  return Model.create(data, {
    hooks: false,
  })
}

module.exports = {
  createTestObject,
}
