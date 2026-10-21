import React from 'react'

export type StudentNumberRemoval =
  // A removed chip, or all of them when the input is cleared
  { kind: 'input'; removedStudentNumbers: string[]; studentNumbers: string[] } | { kind: 'errors' }

type Phase = 'closed' | 'open' | 'confirmed'

// Keeps track of the student numbers waiting for confirmation in RemoveStudentNumbersDialog
export const useStudentNumberRemoval = (onRemove: (removal: StudentNumberRemoval) => void) => {
  const [removal, setRemoval] = React.useState<StudentNumberRemoval | null>(null)
  const [phase, setPhase] = React.useState<Phase>('closed')

  const requestRemoval = (nextRemoval: StudentNumberRemoval) => {
    setRemoval(nextRemoval)
    setPhase('open')
  }

  return {
    requestRemoval,
    dialogProps: {
      open: phase === 'open',
      removal,
      // The removed chips and the remove button disappear, so onRemove moves focus instead
      disableRestoreFocus: phase === 'confirmed',
      onConfirm: () => setPhase('confirmed'),
      onClose: () => setPhase('closed'),
      // Remove only after the transition: while the dialog is open the rest of the page is
      // aria-hidden, and Firefox does not announce focus moved into hidden content
      onExited: () => {
        if (phase === 'confirmed' && removal) onRemove(removal)
        setRemoval(null)
        setPhase('closed')
      },
    },
  }
}
