import { Container } from '@mui/material'
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import UserFeedbacks from '../../components/UserFeedbacks'
import AdminView from '../../components/AdminView'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import CourseSummary from '../../components/CourseSummary'
import TeacherView from '../../components/TeacherView'
import CourseRealisationFeedback from '../../components/CourseRealisationFeedback'
import Organisation from './Organisation'
import FeedbackTarget from './FeedbackTarget'
import NorppaFeedback from '../../components/NorppaFeedback'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import useIsMobile from '../../hooks/useIsMobile'

const styles = {
  container: (theme) => ({
    padding: '2rem',
    [theme.breakpoints.down('md')]: {
      padding: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '0.2rem',
    },
    marginTop: '1rem',
  }),
}

const Home = () => {
  const { courseSummaryAccessInfo, isLoading: accessInfoLoading } =
    useCourseSummaryAccessInfo()
  const isMobile = useIsMobile()

  if (accessInfoLoading) {
    return <LoadingProgress />
  }

  if (!isMobile && courseSummaryAccessInfo.adminAccess) {
    return <Redirect to="/course-summary" />
  }

  if (courseSummaryAccessInfo.accessible) {
    return <Redirect to="/courses" />
  }
  return <Redirect to="/feedbacks" />
}

const Router = () => (
  <Container sx={styles.container} maxWidth="xl">
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/feedbacks" component={UserFeedbacks} exact />
      <Route path="/courses" component={TeacherView} exact />
      <Route path="/targets/:id" component={FeedbackTarget} />
      <Route path="/organisations/:code" component={Organisation} />
      <Route path="/course-summary" component={CourseSummary} />
      <Route path="/cur/:id" component={CourseRealisationFeedback} />
      <Route path="/norppa-feedback" component={NorppaFeedback} />
      <Route path="/admin" component={AdminView} />
    </Switch>
  </Container>
)

export default Router
