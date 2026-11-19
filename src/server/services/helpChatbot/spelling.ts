// Norppa inflects like the noun norppa: one p before an ending that closes the syllable (Norpan, Norpassa), two
// before a vowel (Norppaa, Norppaan). Prompt rules didn't stop the model from mixing them up.
const WEAK = /\b([Nn])orppa(n|ssa|sta|lla|lta|lle|ksi|tta)(?=(?:kin|kaan|kään|han|hän|ko|kö)?\b)/g
const STRONG = /\b([Nn])orpa(a|an|na)(?=(?:kin|kaan|kään|han|hän|ko|kö)?\b)/g

export const fixNorppaSpelling = (text: string) =>
  text
    .replace(WEAK, '$1orpa$2')
    .replace(STRONG, '$1orppa$2')
    .replace(/\bNorppaAI\b/g, 'NorppAI')
