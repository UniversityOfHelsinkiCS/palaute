const inE2EMode = process.env.REACT_APP_E2E === 'true'

export const baseUrl = inE2EMode ? 'localhost:3000' : 'localhost:3000'
