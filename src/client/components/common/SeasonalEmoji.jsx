import React from 'react'

const SeasonalEmoji = () => {
  const today = new Date()
  const day = today.getUTCDate()
  const month = today.getUTCMonth() + 1

  let emoji = <>🎉</>

  if (month === 10 && day === 31) {
    emoji = <>🎃</>
  } else if (month === 12) {
    if (day === 6) {
      emoji = <>🇫🇮</>
    }
    if (day === 24) {
      emoji = <>🎁</>
    }
    if (day === 25 || day === 26) {
      emoji = <>🎄</>
    }
    if (day === 31) {
      emoji = <>🎆</>
    }
  }

  return emoji
}

export default SeasonalEmoji
