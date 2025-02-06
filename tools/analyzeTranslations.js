/* eslint-disable */
const fs = require('fs/promises')
const readline = require('readline')
const path = require('path')
const minimist = require('minimist')
const { merge } = require('lodash')

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

const log0 = (...msg) => {
  if (!args.quiet) {
    console.log(...msg)
  }
}

const log = (...msg) => {
  console.log(...msg)
}

/**
 * Main
 */
;(async () => {
  if (args.help) {
    printHelp()
    return
  }

  const argLangs = args.lang ? args.lang.split(',') : LANGUAGES

  const translationKeyReferences = new Map()
  let fileCount = 0
  log0(`Analyzing ${ROOT_PATH}...`)
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
  log0(`Found ${translationKeyReferences.size} references in ${fileCount} files`)

  const locales = {}

  for await (const lang of LANGUAGES) {
    locales[lang] = require(`../${LOCALES_PATH}/${lang}/${NAMESPACE}.json`)
  }
  log0('Imported translation modules')

  const translationsNotUsed = new Set()

  const findKeysRecursively = (obj, path) => {
    const keys = []
    Object.keys(obj).forEach(k => {
      if (typeof obj[k] === 'object') {
        keys.push(...findKeysRecursively(obj[k], `${path}:${k}`)) // Go deeper...
      } else if (typeof obj[k] === 'string' && obj[k].trim().length > 0) {
        keys.push(`${path}:${k}`) // Key seems legit
      }
    })
    return keys
  }

  Object.entries(locales).forEach(([_, t]) => {
    findKeysRecursively(t, '').forEach(k => translationsNotUsed.add(k.slice(1)))
  })

  const numberOfTranslations = translationsNotUsed.size
  log0('Generated translation keys\n')
  log0(`${Underscore}Listing references with missing translations${Reset}\n`)

  let longestKey = 0
  translationKeyReferences.forEach((v, k) => {
    if (k.length > longestKey) longestKey = k.length
  })

  let missingCount = 0
  const missingByLang = Object.fromEntries(argLangs.map(l => [l, []]))

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

    if (missing.length > 0 && missing.some(l => argLangs.includes(l))) {
      missingCount += printMissing(k, v, missing, longestKey)
      missing.forEach(l => argLangs.includes(l) && missingByLang[l].push(k))
    }
  })

  if (missingCount > 0) {
    log(`\n${FgRed}${Bright}Error:${Reset} ${missingCount} translations missing\n`)
    const langsOpt = args.lang ? `--lang ${argLangs.join(',')}` : ''
    const recommendedCmd = `${FgCyan}npm run translations -- --create ${langsOpt}${Reset}`
    log(`Run to populate missing translations now:\n> ${recommendedCmd}\n`)
  }

  if (args.unused) {
    printUnused(translationsNotUsed, numberOfTranslations)
  }

  if (args.create) {
    await createMissingTranslations(missingByLang)
  }

  if (missingCount > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
})()

const printMissing = (translationKey, referenceLocations, missingLangs, longestKey) => {
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

  return missingLangs.length
}

const printUnused = (translationsNotUsed, numberOfTranslations) => {
  console.log(
    `${Underscore}Potentially unused translations (${translationsNotUsed.size}/${numberOfTranslations}): ${Reset}`
  )
  console.log(`${FgMagenta}please check if they are used before deleting${Reset}`)
  translationsNotUsed.forEach(t => console.log(`  ${t.split(':').join(`${FgMagenta}:${Reset}`)}`))
}

const createMissingTranslations = async missingByLang => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const prompt = query => new Promise(resolve => rl.question(query, resolve))

  rl.on('close', () => {
    console.log('Cancelled')
    process.exit(1)
  })

  const promptInfosByKeys = {}

  Object.entries(missingByLang).forEach(([lang, missingKeys]) => {
    missingKeys.forEach(k => {
      if (!promptInfosByKeys[k]) {
        promptInfosByKeys[k] = []
      }

      promptInfosByKeys[k].push({
        lang,
        value: '',
      })
    })
  })

  for (const [k, info] of Object.entries(promptInfosByKeys)) {
    console.log(`\nAdd translations for ${FgYellow}${k}${Reset}`)
    for (const i of info) {
      const value = await prompt(`${FgCyan}${i.lang}${Reset}: `)
      i.value = value
    }
  }

  const newTranslationsByLang = {}

  Object.entries(promptInfosByKeys).forEach(([k, info]) => {
    info.forEach(i => {
      if (!i.value) {
        return
      }

      if (!newTranslationsByLang[i.lang]) {
        newTranslationsByLang[i.lang] = {}
      }

      const parts = k.split(':')
      let obj = newTranslationsByLang[i.lang]

      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) {
          obj[parts[i]] = {}
        }
        obj = obj[parts[i]]
      }

      obj[parts[parts.length - 1]] = i.value
    })
  })

  // Write new translations to files
  console.log('Writing new translations to files...')
  await Promise.all(
    Object.entries(newTranslationsByLang).map(async ([lang, translations]) => {
      const filePath = path.join(LOCALES_PATH, lang, `${NAMESPACE}.json`)

      const translationObject = require(`../${LOCALES_PATH}/${lang}/${NAMESPACE}.json`)

      // Deep merge
      const merged = merge(translationObject, translations)

      await fs.writeFile(filePath, JSON.stringify(merged, null, 2))
    })
  )
}

function printHelp() {
  console.log('Usage:')
  console.log('--lang fi,sv,en')
  console.log('--unused: print all potentially unused translation fields')
  console.log('--detailed: Show usage locations')
  console.log('--quiet: Print less stuff')
  console.log('--create: Populate missing translations in translation files')
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
