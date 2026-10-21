import fs from 'node:fs'
import path from 'node:path'

export const createTranslate = (lang: string) => {
  const file = path.resolve(__dirname, '../../public/locales', lang, 'translation.json')
  const translations = JSON.parse(fs.readFileSync(file, 'utf8'))
  return (key: string): string => {
    const [namespace, name] = key.split(':')
    const label = translations[namespace]?.[name]
    if (typeof label !== 'string') throw new Error(`No ${lang} translation for ${key}`)
    return label
  }
}

export type Translate = ReturnType<typeof createTranslate>
