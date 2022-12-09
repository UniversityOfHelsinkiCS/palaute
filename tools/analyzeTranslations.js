/* eslint-disable */
const fs = require('fs/promises')
const path = require('path')

/**
 * Console colors
 */
const Reset = '\x1b[0m'
const Bright = '\x1b[1m'
const Dim = '\x1b[2m'
const Underscore = '\x1b[4m'
const Blink = '\x1b[5m'
const Reverse = '\x1b[7m'
const Hidden = '\x1b[8m'
const FgBlack = '\x1b[30m'
const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'
const FgYellow = '\x1b[33m'
const FgBlue = '\x1b[34m'
const FgMagenta = '\x1b[35m'
const FgCyan = '\x1b[36m'
const FgWhite = '\x1b[37m'
const BgBlack = '\x1b[40m'
const BgRed = '\x1b[41m'
const BgGreen = '\x1b[42m'
const BgYellow = '\x1b[43m'
const BgBlue = '\x1b[44m'
const BgMagenta = '\x1b[45m'
const BgCyan = '\x1b[46m'
const BgWhite = '\x1b[47m'

/**
 * Paths and regexs
 */
const CLIENT_PATH = './src/client'
const LOCALES_DIR_NAME = 'locales'
const LOCALES_PATH = './src/client/locales'
const EXTENSION_MATCHER = /.+\.js/
// matches 'asd:asd'
const TRANSLATION_KEY_REFERENCE_MATCHER = new RegExp(
  /['"`]\w+(?::\w+)+['"`]/,
  'g',
)
// matches t('asd'
const TRANSLATION_KEY_REFERENCE_MATCHER_2 = new RegExp(
  /\bt\(['"`]\w+(?::\w+)*['"`]/,
  'g',
)

/**
 * Recursive filewalk
 * @param {} dir
 */
async function* walk(dir) {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory() && d.name !== LOCALES_DIR_NAME) yield* walk(entry)
    else if (d.isFile() && EXTENSION_MATCHER.test(d.name)) yield entry
  }
}

/**
 * A line location in file
 */
class Location {
  constructor(file, line) {
    this.file = file
    this.line = line
  }

  toString() {
    return `${this.file}:${this.line}`
  }
}

/**
 * Main
 */
;(async () => {
  const translationKeyReferences = new Map()
  console.log('Analyzing...')
  for await (const file of walk(CLIENT_PATH)) {
    const contents = await fs.readFile(file, 'utf8')
    let lineNumber = 1
    for (const line of contents.split('\n')) {
      ;[...line.matchAll(TRANSLATION_KEY_REFERENCE_MATCHER)]
        .concat([...line.matchAll(TRANSLATION_KEY_REFERENCE_MATCHER_2)])
        .flat()
        .forEach((match) => {
          const t = match.startsWith('t')
          const common = !match.includes(':')
          const location = new Location(file, lineNumber)
          const reference = `${common ? 'common:' : ''}${match.slice(
            t ? 3 : 1,
            match.length - 1,
          )}`
          if (translationKeyReferences.has(reference)) {
            translationKeyReferences.get(reference).push(location)
          } else {
            translationKeyReferences.set(reference, [location])
          }
        })

      lineNumber += 1
    }
  }
  console.log(`Found ${translationKeyReferences.size} references`)

  const locales = {}

  const importTranslationObjectFromESModule = async (f) => {
    const content = await fs.readFile(f, 'utf8')
    const jsLines = ['"use strict";({']
    let objectStarted = false
    for (const line of content.split('\n')) {
      if (objectStarted) {
        jsLines.push(line)
      }
      if (line.startsWith('export default')) {
        objectStarted = true
      }
    }
    jsLines.push(')')

    const js = jsLines.join('\n')
    return eval?.(js)
  }

  for await (const fileName of walk(LOCALES_PATH)) {
    const lang = fileName.slice(fileName.length - 5, fileName.length - 3)
    locales[lang] = await importTranslationObjectFromESModule(fileName)
  }
  console.log('Imported translation modules')

  const translationsNotUsed = new Set()
  const findKeysRecursively = (obj, path) => {
    const keys = []
    Object.keys(obj).forEach((k) => {
      if (typeof obj[k] === 'object') {
        keys.push(...findKeysRecursively(obj[k], `${path}:${k}`))
      } else if (typeof obj[k] === 'string') {
        keys.push(`${path}:${k}`)
      }
    })
    return keys
  }
  Object.entries(locales).forEach(([_, t]) => {
    findKeysRecursively(t, '').forEach((k) =>
      translationsNotUsed.add(k.slice(1)),
    )
  })
  const numberOfTranslations = translationsNotUsed.size
  console.log('Generated translation keys\n')
  console.log(
    `${Underscore}Listing references with missing translations${Reset}\n`,
  )

  translationKeyReferences.forEach((v, k) => {
    const missing = []
    const parts = k.split(':')

    Object.entries(locales).forEach(([lang, t]) => {
      let obj = t
      for (const p of parts) {
        obj = obj[p]
        if (!obj) break
      }
      if (typeof obj !== 'string') {
        missing.push(lang)
      } else {
        translationsNotUsed.delete(k)
      }
    })

    if (missing.length > 0) {
      console.log(
        `${Underscore}${k} (${v.length} refs)${Reset}\n${FgCyan}${v.join(
          '\n',
        )}`,
      )
      console.log(FgRed, `Missing: ${missing.join(', ')}`)
      console.log(Reset, '')
    }
  })

  console.log(
    `${Underscore}Potentially unused translations (${translationsNotUsed.size}/${numberOfTranslations}): ${Reset}`,
  )
  console.log(
    `${FgMagenta}please check if they are used before deleting${Reset}`,
  )
  translationsNotUsed.forEach((t) =>
    console.log(`  ${t.split(':').join(`${FgMagenta}:${Reset}`)}`),
  )
})()
