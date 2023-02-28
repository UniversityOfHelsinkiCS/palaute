import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Wraps a mutation function in error and success reporting
 * @param {(args: any) => Promise<any>} mutation the mutation function
 */
const useInteractiveMutation = (mutation, options = { success: undefined, error: undefined }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const interactiveMutation = React.useCallback(
    async args => {
      try {
        await mutation(args)
        enqueueSnackbar(options.success ?? t('common:saveSuccess'), { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(
          typeof options.error === 'function' ? options.error(error) : options.error ?? t('common:unknownError'),
          { variant: 'error' }
        )
      }
    },
    [mutation, options]
  )

  return interactiveMutation
}

export default useInteractiveMutation
