import React from 'react'
import styles from '../../util/chipStyles'
import LinkChip from '../../components/common/LinkChip'

const InterimFeedbackChip = ({ id }) => {
  const url = `/targets/${id}/interim-feedback`

  return (
    <LinkChip
      to={url}
      label={'Välipalaute käynnissä'}
      sx={{
        ...styles.interim,
        ...styles.interactive,
      }}
    />
  )
}

export default InterimFeedbackChip
