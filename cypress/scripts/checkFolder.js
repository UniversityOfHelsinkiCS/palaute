const fs = require('fs')
const path = require('path')

const checkFolder = folderPath => {
  const resolvedPath = path.resolve(folderPath)
  const files = fs.readdirSync(resolvedPath)

  return files
}

module.exports = { checkFolder }
