const statuses = {
  attempt: '_ATTEMPT',
  success: '_SUCCESS',
  failure: '_FAILURE',
}

const createPrefix = (method = 'get', resource) =>
  `${method}_${resource}`.toUpperCase()

const buildAction = (resource, argsForAxios, id) => {
  const prefix = createPrefix(argsForAxios.method, resource)
  return {
    type: prefix + statuses.attempt,
    requestSettings: argsForAxios,
    id,
  }
}

export default buildAction
