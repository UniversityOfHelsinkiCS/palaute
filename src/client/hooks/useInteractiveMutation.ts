import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface UseInteractiveMutationOptions {
  success?: string
  error?: string | ((error: unknown) => string)
}

const useInteractiveMutation = <TArgs>(
  mutation: (args: TArgs) => Promise<unknown>,
  options: UseInteractiveMutationOptions = {}
) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const interactiveMutation = React.useCallback(
    async (args: TArgs) => {
      try {
        await mutation(args)
        enqueueSnackbar(options.success ?? t('common:saveSuccess'), { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(
          typeof options.error === 'function' ? options.error(error) : (options.error ?? t('common:unknownError')),
          { variant: 'error' }
        )
      }
    },
    [mutation, options]
  )

  return interactiveMutation
}

export default useInteractiveMutation
