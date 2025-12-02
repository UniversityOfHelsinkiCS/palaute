import { FeedbackTarget, CourseUnit, CourseRealisation } from '../../models'

const getFeedbackErrorViewDetails = (id: number | string) =>
  FeedbackTarget.findByPk(id, {
    attributes: ['id', 'name', 'userCreated', 'opensAt', 'closesAt'],
    include: [
      {
        attributes: ['id', 'name', 'courseCode', 'userCreated'],
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
      },
      {
        attributes: ['id', 'name', 'userCreated', 'startDate', 'endDate'],
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
    ],
  })

export { getFeedbackErrorViewDetails }
