const XLSX = require('xlsx')

const readXLSX = filePath => {
  const workbook = XLSX.readFile(filePath)

  // Return as json object
  return Object.fromEntries(
    workbook.SheetNames.map(sheetName => [sheetName, XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])])
  )
}

module.exports = { readXLSX }
