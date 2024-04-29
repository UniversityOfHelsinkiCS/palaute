const fs = require('fs')
const path = require('path')

const directoryPath = path.join(__dirname, 'src', 'client')

function renameJsToJsx(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading the directory:', err)
      return
    }

    files.forEach(file => {
      const filePath = path.join(dir, file)

      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error('Error getting the file stats:', err)
          return
        }

        if (stat.isDirectory()) {
          renameJsToJsx(filePath) // Recursive call for directories
        } else if (path.extname(file) === '.js' && /^[A-Z]/.test(file)) {
          // Check if the file starts with an uppercase letter and has a .js extension
          const newFilePath = filePath.slice(0, -3) + '.jsx' // Replace .js with .jsx
          fs.rename(filePath, newFilePath, err => {
            if (err) {
              console.error('Error renaming the file:', err)
              return
            }
            console.log(`Renamed: ${filePath} -> ${newFilePath}`)
          })
        }
      })
    })
  })
}

renameJsToJsx(directoryPath)
