const chokidar = require('chokidar')

const watcher = chokidar.watch('src', {
  ignored: (path) => path.includes('client'),
}) // Watch server folder
console.log('Enabling devmode, listening to changes in src except client.')

watcher.on('ready', () => {
  watcher.on('all', () => {
    console.log('Reloaded server')
    Object.keys(require.cache).forEach((id) => {
      if (id.includes('src')) delete require.cache[id] // Delete all require caches that point to server folder enabling automatic reload
    })
  })
})
