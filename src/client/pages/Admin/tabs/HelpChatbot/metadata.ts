import type { HelpChatbotSavedMetadata } from '@common/types/helpChatbotAdmin'

export type MetadataEntry = { key: string; label: string; value: string }

// Keys not listed here are shown as they are
const LABELS: Record<string, string> = {
  uiLanguage: 'UI language',
  impersonatedUserId: 'Viewing as',
}

const formatValue = (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value))

// Known keys first, then the rest alphabetically: Postgres doesn't keep a JSON object's key order
const keyOrder = (key: string) => {
  const known = Object.keys(LABELS).indexOf(key)
  return known === -1 ? Infinity : known
}

export const describeMetadata = (
  metadata: HelpChatbotSavedMetadata,
  impersonatedUsername: string | null
): MetadataEntry[] =>
  Object.entries(metadata)
    .sort(([a], [b]) => keyOrder(a) - keyOrder(b) || a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: LABELS[key] ?? key,
      value: key === 'impersonatedUserId' && impersonatedUsername ? impersonatedUsername : formatValue(value),
    }))

// A key only `base` has shows as "none"
export const metadataChanges = (entries: MetadataEntry[], base: MetadataEntry[]): MetadataEntry[] => {
  const baseValues = new Map(base.map(entry => [entry.key, entry.value]))
  const keys = new Set(entries.map(entry => entry.key))
  return [
    ...entries.filter(entry => baseValues.get(entry.key) !== entry.value),
    ...base.filter(entry => !keys.has(entry.key)).map(entry => ({ ...entry, value: 'none' })),
  ]
}

export const formatEntries = (entries: MetadataEntry[]) =>
  entries.map(({ label, value }) => `${label}: ${value}`).join(' · ')

export const getUiLanguage = (metadata: HelpChatbotSavedMetadata) =>
  typeof metadata.uiLanguage === 'string' ? metadata.uiLanguage : null
