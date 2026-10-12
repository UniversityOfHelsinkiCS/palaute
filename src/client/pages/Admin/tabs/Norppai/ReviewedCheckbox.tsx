import { Checkbox, FormControlLabel } from '@mui/material'
import { useSnackbar } from 'notistack'

import { useSetReviewed } from './api'

type ReviewedCheckboxProps = {
  turnId: string
  reviewedAt: string | null
}

// Marks feedback handled, which takes it out of the "new" count
const ReviewedCheckbox = ({ turnId, reviewedAt }: ReviewedCheckboxProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { mutate, isPending, variables } = useSetReviewed()
  // Shows the click at once; the refetch then confirms it
  const checked = isPending && variables ? variables.reviewed : reviewedAt !== null

  const toggle = (reviewed: boolean) =>
    mutate(
      { turnId, reviewed },
      { onError: () => enqueueSnackbar("The review mark couldn't be saved", { variant: 'error' }) }
    )

  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={checked} onChange={event => toggle(event.target.checked)} />}
      label="Reviewed"
      sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
    />
  )
}

export default ReviewedCheckbox
