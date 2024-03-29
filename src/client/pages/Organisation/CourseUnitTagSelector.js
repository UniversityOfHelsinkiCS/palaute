import React from 'react'
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TagSelector from './TagSelector'
import useUpdateCourseUnitTags from './useUpdateCourseUnitTags'

const CourseUnitTagSelector = ({ courseUnit, organisation, onClose }) => {
  const { t, i18n } = useTranslation()
  const mutation = useUpdateCourseUnitTags()

  const handleSubmit = async tagIds => {
    await mutation.mutateAsync({
      organisationCode: organisation.code,
      courseCode: courseUnit.courseCode,
      tagIds,
    })
  }

  return (
    <Dialog open={Boolean(courseUnit)} onClose={onClose}>
      {courseUnit && (
        <>
          <DialogTitle>
            {t('organisationSettings:setStudyTracksForCourseUnit', {
              name: courseUnit.name[i18n.language],
              code: courseUnit.courseCode,
            })}
          </DialogTitle>
          <DialogContent sx={{ pt: '3rem' }}>
            <DialogContentText>{t('organisationSettings:courseUnitTagSettingInfo')}</DialogContentText>
            <Box mb="1rem" mt="2rem">
              <TagSelector
                objectIds={[courseUnit.id]}
                originalTagIds={courseUnit.tags.map(t => t.id)}
                tags={organisation.tags}
                onClose={onClose}
                mutation={handleSubmit}
              />
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}

export default CourseUnitTagSelector
