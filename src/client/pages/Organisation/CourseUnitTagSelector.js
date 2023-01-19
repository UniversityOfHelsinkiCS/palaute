import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TagSelector from './TagSelector'
import useUpdateCourseUnitTags from './useUpdateCourseUnitTags'

const CourseUnitTagSelector = ({ courseUnit, organisation, onClose }) => {
  const { t, i18n } = useTranslation()
  const mutation = useUpdateCourseUnitTags()

  const handleSubmit = async tagIds => {
    await mutation.mutateAsync({
      organisationCode: organisation.code,
      courseUnitId: courseUnit.id,
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
            <TagSelector
              objectIds={[courseUnit.id]}
              originalTagIds={courseUnit.tags.map(t => t.id)}
              tags={organisation.tags}
              onClose={onClose}
              mutation={handleSubmit}
            />
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}

export default CourseUnitTagSelector
