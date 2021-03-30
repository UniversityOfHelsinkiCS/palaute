import React from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Button } from '@material-ui/core'

const CourseListItem = ({ course }) => {
  const history = useHistory()

  const handleButton = () => {
    history.push(`/edit/${course.id}`)
  }

  return (
    <Box maxWidth="md" border={2} borderRadius={10} m={2} padding={2}>
      <h4>{course.name.fi}</h4>
      <Button variant="contained" color="primary" onClick={handleButton}>
        Anna palautetta
      </Button>
    </Box>
  )
}

export default CourseListItem
