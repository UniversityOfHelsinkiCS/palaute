import { SUMMARY_COLORS, SUMMARY_COLOR_SCALE_MAX, SUMMARY_COLOR_SCALE_MIN } from './common'

const getColorIndex = mean => {
  if (mean < 1.0) return 0 // Case: no data
  if (mean <= SUMMARY_COLOR_SCALE_MIN) return 1 // Case: bad
  if (mean >= SUMMARY_COLOR_SCALE_MAX) return SUMMARY_COLORS.length - 1 // Case: awesome

  // map range MIN-MAX to 2-SUMMARY_COLORS.length - 2
  // cases 0 (no data), 1 (worst) and SUMMARY_COLORS.length - 1 (best) are already handled above.
  const index =
    1 +
    Math.ceil(
      ((mean - SUMMARY_COLOR_SCALE_MIN) / (SUMMARY_COLOR_SCALE_MAX - SUMMARY_COLOR_SCALE_MIN)) *
        (SUMMARY_COLORS.length - 3)
    )
  return index
}

export const getColor = mean => SUMMARY_COLORS[getColorIndex(mean)]
