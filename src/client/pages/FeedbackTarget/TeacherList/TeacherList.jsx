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
    <Accordion
      {...rest}
      elevation={0}
      disableGutters
      defaultExpanded={open}
      sx={{
        m: 0,
        p: 0,
        bgcolor: 'transparent',
        '&::before': {
          display: 'none', // remove the default divider line
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          p: 0,
          m: 0,
          minHeight: 'unset',
          '& .MuiAccordionSummary-content': {
            m: 0,
            p: 0,
          },
          '&.Mui-expanded': { minHeight: 'unset' },
          '& .MuiAccordionSummary-content.Mui-expanded': { margin: 0 },
        }}
      >
        <Typography sx={{ m: 0, p: 0, mr: '1rem' }}>
          {title} ({teachers.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ m: 0, py: 0 }}>
        <List sx={{ mt: '0.5rem' }}>
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
