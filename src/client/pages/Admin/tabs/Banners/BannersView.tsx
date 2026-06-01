import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, useTheme } from '@mui/material'
import { PaletteColor, Theme } from '@mui/material/styles'
import { addDays } from 'date-fns'
import { Formik } from 'formik'
import React from 'react'
import type { LanguageId } from '@common/types/common'
import Banner from '../../../../components/common/Banner'
import FormikDatePicker from '../../../../components/common/FormikDatePicker'
import FormikSelect from '../../../../components/common/FormikSelect'
import FormikTextField from '../../../../components/common/FormikTextField'
import LanguageSelect from '../../../../components/common/LanguageSelect'
import { NorButton } from '../../../../components/common/NorButton'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import useBanners from '../../../../hooks/useBanners'
import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'

interface BannerData {
  text: { fi: string; sv: string; en: string }
  color: string
}

interface BannerRecord {
  id: number
  data: BannerData
  accessGroup: 'STUDENT' | 'TEACHER' | 'ORG' | 'ADMIN'
  startDate: string | Date
  endDate: string | Date
  color?: string
}

type PaletteHue = 'white' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
type Lightness = 'light' | 'main' | 'dark'

interface FormValues {
  textFi: string
  textSv: string
  textEn: string
  hue: PaletteHue
  lightness: Lightness
  accessGroup: string
  startDate: Date
  endDate: Date
}

const getHexColor = (theme: Theme, hue: PaletteHue, lightness: Lightness): string => {
  if (hue === 'white') return theme.palette.common.white
  const colors: Record<Exclude<PaletteHue, 'white'>, PaletteColor> = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    success: theme.palette.success,
    info: theme.palette.info,
    warning: theme.palette.warning,
    error: theme.palette.error,
  }
  return colors[hue][lightness]
}

const formValuesToBannerData = (theme: Theme, values: FormValues) => ({
  ...values,
  data: {
    text: { fi: values.textFi, sv: values.textSv, en: values.textEn },
    color: getHexColor(theme, values.hue, values.lightness),
  },
})

const bannerDataToFormValues = (banner: BannerRecord): FormValues => ({
  textFi: banner.data.text.fi,
  textSv: banner.data.text.sv,
  textEn: banner.data.text.en,
  hue: 'primary',
  lightness: 'light',
  accessGroup: banner.accessGroup,
  startDate: new Date(banner.startDate),
  endDate: new Date(banner.endDate),
})

interface BannerPreviewProps {
  values: FormValues
}

const BannerPreview = ({ values }: BannerPreviewProps) => {
  const [l, setL] = React.useState<LanguageId>('fi')
  const theme = useTheme()

  return (
    <Box position="absolute" top={0} left={0} zIndex={theme.zIndex.modal + 1}>
      <Banner banner={formValuesToBannerData(theme, values)} language={l} disabled={false} />
      <Box m={1} display="flex" flexDirection="column" rowGap={1} alignItems="start">
        <Alert severity="info">Preview</Alert>
        <Paper elevation={0}>
          <LanguageSelect value={l} onChange={(v: LanguageId) => setL(v)} label={undefined} />
        </Paper>
      </Box>
    </Box>
  )
}

const hueOptions = [
  { value: 'white', label: 'white' },
  { value: 'primary', label: 'primary' },
  { value: 'secondary', label: 'secondary' },
  { value: 'success', label: 'success' },
  { value: 'info', label: 'info' },
  { value: 'warning', label: 'warning' },
  { value: 'error', label: 'error' },
]

const lightnessOptions = [
  { value: 'light', label: 'light' },
  { value: 'main', label: 'main' },
  { value: 'dark', label: 'dark' },
]

const accessGroupOptions = [
  { value: 'STUDENT', label: 'STUDENT' },
  { value: 'TEACHER', label: 'TEACHER' },
  { value: 'ORG', label: 'ORG' },
  { value: 'ADMIN', label: 'ADMIN' },
]

interface FuckReactProps {
  value: BannerRecord | null
  funcThing: (value: BannerRecord) => void
}

const FuckReact = ({ value, funcThing }: FuckReactProps) => {
  React.useEffect(() => {
    if (value) funcThing(value)
  }, [value])
  return <div />
}

interface BannerFormProps {
  onSubmit: (values: FormValues) => Promise<void>
  selected: BannerRecord | null
  open: boolean
  setOpen: (open: boolean) => void
}

const BannerForm = ({ onSubmit, selected, open, setOpen }: BannerFormProps) => (
  <div>
    <NorButton onClick={() => setOpen(true)}>Create new banner</NorButton>
    <Formik<FormValues>
      onSubmit={async values => {
        await onSubmit(values)
        setOpen(false)
      }}
      initialValues={{
        textFi: '',
        textSv: '',
        textEn: '',
        hue: 'primary',
        lightness: 'light',
        accessGroup: 'TEACHER',
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
      }}
    >
      {({ setValues, values, handleSubmit }) => (
        <>
          <FuckReact value={selected} funcThing={v => setValues(bannerDataToFormValues(v))} />
          <Dialog open={open} onClose={() => setOpen(false)} sx={{ maxHeight: '75vh', top: '20vh' }}>
            <DialogTitle>Create new banner</DialogTitle>
            <DialogContent>
              <Box my={2}>
                <FormikTextField
                  name="textFi"
                  label="Markdown content (FI)"
                  multiline
                  fullWidth
                  helperText={undefined}
                  onBlur={undefined}
                />
              </Box>
              <FormikTextField
                name="textSv"
                label="Markdown content (SV)"
                multiline
                fullWidth
                helperText={undefined}
                onBlur={undefined}
              />
              <Box m={2} />
              <FormikTextField
                name="textEn"
                label="Markdown content (EN)"
                multiline
                fullWidth
                helperText={undefined}
                onBlur={undefined}
              />
              <Box my={3}>
                <Divider />
              </Box>
              <FormikSelect name="hue" label="Hue" options={hueOptions} />
              <FormikSelect name="lightness" label="Lightness" options={lightnessOptions} />
              <Box my={3}>
                <Divider />
              </Box>
              <FormikDatePicker name="startDate" label="Start date" />
              <FormikDatePicker name="endDate" label="End date" />
              <Box my={3}>
                <Divider />
              </Box>
              <FormikSelect name="accessGroup" label="Target group" options={accessGroupOptions} />
            </DialogContent>
            <DialogActions>
              <NorButton onClick={() => handleSubmit()}>{selected ? 'Edit' : 'Create'}</NorButton>
            </DialogActions>
          </Dialog>
          {open && <BannerPreview values={values} />}
        </>
      )}
    </Formik>
  </div>
)

const BannerView = () => {
  const { authorizedUser } = useAuthorizedUser()
  const { banners } = useBanners() as { banners: BannerRecord[] | undefined }
  const [selected, setSelected] = React.useState<BannerRecord | null>(null)
  const [open, setOpen] = React.useState(false)
  const theme = useTheme()

  const handleSubmit = async (bannerValues: FormValues) => {
    try {
      if (selected) {
        await apiClient.put(`/admin/banners/${selected.id}`, formValuesToBannerData(theme, bannerValues))
      } else {
        await apiClient.post('/admin/banners', formValuesToBannerData(theme, bannerValues))
      }
      await queryClient.refetchQueries({ queryKey: ['authorizedUser'] })
      await queryClient.refetchQueries({ queryKey: ['banners'] })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this banner for good?')) return
    try {
      await apiClient.delete(`/admin/banners/${id}`)
      await queryClient.refetchQueries({ queryKey: ['authorizedUser'] })
      await queryClient.refetchQueries({ queryKey: ['banners'] })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return (
    <div>
      <BannerForm onSubmit={handleSubmit} selected={selected} open={open} setOpen={setOpen} />
      {banners?.map(banner => (
        <Box m={2} key={banner.id}>
          <Paper variant="outlined">
            <Box padding={2}>
              <Banner banner={banner} language={authorizedUser?.language} disabled />
              <Box display="flex" columnGap={2}>
                <div>Color: {banner.color}</div>
                <div>Start date: {String(banner.startDate)}</div>
                <div>End date: {String(banner.endDate)}</div>
                <div>Access group: {banner.accessGroup}</div>
                <Box ml="auto">
                  <NorButton
                    color="primary"
                    onClick={() => {
                      setSelected(banner)
                      setOpen(true)
                    }}
                  >
                    EDIT
                  </NorButton>
                  <NorButton color="error" onClick={() => handleDelete(banner.id)}>
                    DELETE
                  </NorButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      ))}
    </div>
  )
}

export default BannerView
