import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary, List, ListItem, Typography } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import TeacherChip from '../../../components/common/TeacherChip'
import { deleteResponsibleTeacher } from './api'

const TeacherList = ({ teachers, title, open, ...rest }) => {
  const { t } = useTranslation()
  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()

  const handleDeleteTeacher = async teacher => {
    const displayName = `${teacher.firstName} ${teacher.lastName}`

    const message = t('feedbackTargetView:deleteTeacherConfirmation', {
      name: displayName,
    })

    if (window.confirm(message)) {
      try {
        await deleteResponsibleTeacher(feedbackTarget, teacher)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  return (
    <Accordion {...rest} elevation={0} sx={{ bgcolor: 'transparent' }} disableGutters defaultExpanded={open}>
      <AccordionSummary sx={{ py: 0, mb: '-0.5rem' }} expandIcon={<ExpandMore />}>
        <Typography sx={{ mr: '0.5rem' }}>
          {title} ({teachers.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0 }}>
        <List>
          {teachers.map(teacher => (
            <ListItem key={teacher.id} disablePadding>
              <TeacherChip user={teacher} onDelete={isAdmin ? () => handleDeleteTeacher(teacher) : undefined} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  )
}

export default TeacherList
