import { Model } from 'sequelize'

class C extends Model {}

export const createTestObject = async <T extends typeof C>(model: T, data: any): Promise<InstanceType<T>> => {
  const oldInstance = await model.findOne({
    where: data.id
      ? {
          id: data.id,
        }
      : data,
  })

  if (oldInstance) {
    /* eslint-disable no-console */
    console.log('Object already exists', oldInstance.toJSON())
    return oldInstance as InstanceType<T>
  }

  return model.create(data, {
    hooks: false,
  }) as Promise<InstanceType<T>>
}
