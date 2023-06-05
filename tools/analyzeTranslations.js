/* eslint-disable */
const fs = require('fs/promises')
const path = require('path')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

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
const ROOT_PATH = './src'
const LOCALES_DIR_NAME = 'locales'
const LOCALES_PATH = './public/locales'
const EXTENSION_MATCHER = /.+\.js/
// matches 'asd:asd'
const TRANSLATION_KEY_REFERENCE_MATCHER = new RegExp(/['"`]\w+(?::\w+)+['"`]/, 'g')
// matches t('asd'
const TRANSLATION_KEY_REFERENCE_MATCHER_2 = new RegExp(/\bt\(['"`]\w+(?::\w+)*['"`]/, 'g')

const LANGUAGES = ['fi', 'sv', 'en']
const NAMESPACE = 'translation'

/**
 * Evil thing of the past
 */
const importTranslationObjectFromESModule = async f => {
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

/**
 * Main
 */
;(async () => {
  if (args.help) {
    printHelp()
    return
  }

  const translationKeyReferences = new Map()
  let fileCount = 0
  console.log(`Analyzing ${ROOT_PATH}...`)
  for await (const file of walk(ROOT_PATH)) {
    fileCount += 1
    const contents = await fs.readFile(file, 'utf8')
    let lineNumber = 1
    for (const line of contents.split('\n')) {
      ;[...line.matchAll(TRANSLATION_KEY_REFERENCE_MATCHER)]
        .concat([...line.matchAll(TRANSLATION_KEY_REFERENCE_MATCHER_2)])
        .flat()
        .forEach(match => {
          const t = match.startsWith('t')
          const common = !match.includes(':')
          const location = new Location(file, lineNumber)
          const reference = `${common ? 'common:' : ''}${match.slice(t ? 3 : 1, match.length - 1)}`
          if (translationKeyReferences.has(reference)) {
            translationKeyReferences.get(reference).push(location)
          } else {
            translationKeyReferences.set(reference, [location])
          }
        })

      lineNumber += 1
    }
  }
  console.log(`Found ${translationKeyReferences.size} references in ${fileCount} files`)

  const locales = {}

  for await (const lang of LANGUAGES) {
    locales[lang] = require(`../${LOCALES_PATH}/${lang}/${NAMESPACE}.json`)
  }
  console.log('Imported translation modules')

  const translationsNotUsed = new Set()
  const findKeysRecursively = (obj, path) => {
    const keys = []
    Object.keys(obj).forEach(k => {
      if (typeof obj[k] === 'object') {
        keys.push(...findKeysRecursively(obj[k], `${path}:${k}`))
      } else if (typeof obj[k] === 'string') {
        keys.push(`${path}:${k}`)
      }
    })
    return keys
  }
  Object.entries(locales).forEach(([_, t]) => {
    findKeysRecursively(t, '').forEach(k => translationsNotUsed.add(k.slice(1)))
  })
  const numberOfTranslations = translationsNotUsed.size
  console.log('Generated translation keys\n')
  console.log(`${Underscore}Listing references with missing translations${Reset}\n`)

  let longestKey = 0
  translationKeyReferences.forEach((v, k) => {
    if (k.length > longestKey) longestKey = k.length
  })

  let missingCount = 0

  translationKeyReferences.forEach((v, k) => {
    const missing = []
    const parts = k.split(':')
    if (parts.includes('continuousFeedbackDigest')) console.log(parts)

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

    missingCount += printMissing(k, v, missing, longestKey)
  })

  console.log(`\n${missingCount} translations missing${Reset}\n`)

  printUnused(translationsNotUsed, numberOfTranslations)
})()

const printMissing = (translationKey, referenceLocations, missingLangs, longestKey) => {
  if (missingLangs.length > 0 && (!args.lang || missingLangs.some(l => args.lang.includes(l)))) {
    let msg = translationKey
    // add padding
    for (let i = 0; i < longestKey - translationKey.length; i++) {
      msg += ' '
    }

    msg += ['fi', 'en', 'sv']
      .map(l => (missingLangs.includes(l) ? `${FgRed}${l}${Reset}` : `${FgGreen}${l}${Reset}`))
      .join(', ')

    if (args.detailed) {
      msg += `\n${FgCyan}${referenceLocations.join('\n')}\n`
    }

    console.log(msg, Reset)
  }

  return missingLangs.length
}

const printUnused = (translationsNotUsed, numberOfTranslations) => {
  if (!args.unused) return

  console.log(
    `${Underscore}Potentially unused translations (${translationsNotUsed.size}/${numberOfTranslations}): ${Reset}`
  )
  console.log(`${FgMagenta}please check if they are used before deleting${Reset}`)
  translationsNotUsed.forEach(t => console.log(`  ${t.split(':').join(`${FgMagenta}:${Reset}`)}`))
}

function printHelp() {
  console.log('Usage:')
  console.log('--lang: fi sv en')
  console.log('--unused: print all potentially unused translation fields')
  console.log('--detailed: Show usage locations')
}

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
