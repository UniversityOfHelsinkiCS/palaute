require('dotenv').config()
require('express-async-errors')
const path = require('path')
const express = require('express')
const { PORT, inProduction } = require('./util/config')
const { connectToDatabase } = require('./util/dbConnection')
const { createOrganisations } = require('./util/importerOrganisations')
const logger = require('./util/logger')
const { Question, Survey } = require('./models')

const app = express()

app.use('/api', (req, res, next) => require('./util/routes')(req, res, next)) // eslint-disable-line
app.use('/api', (_, res) => res.sendStatus(404))

if (inProduction) {
  const DIST_PATH = path.resolve(__dirname, '../../build')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (req, res) => res.sendFile(INDEX_PATH))
}

const questions = [
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojakson oppimistavoitteet olivat selvät',
        en: 'The objectives of the course were clear to me from the beginning',
      },
    },
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojakson toteutus tuki oppimistani',
        en:
          'Activity at the course supported the achievement of learning goals',
      },
    },
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojaksolla käytetyt materiaalit tukivat oppimistani',
        en:
          'The material used in the course supported the achievement of learning goals',
      },
    },
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojakson arviointi mittasi oppimistani',
        en:
          'Assessment of the course measured the achievement of the core learning objectives',
      },
    },
  ],
  [
    'LIKERT',
    { label: { fi: 'Opintojakso oli työläs', en: 'The course was laborious' } },
  ],
]

const createHYQuestions = async () => {
  const ids = await Promise.all(
    questions.map(async (question) => {
      const [questionsWithId] = await Question.findOrCreate({
        where: {
          type: question[0],
          data: question[1],
          required: true,
        },
        defaults: {
          type: question[0],
          data: question[1],
          required: true,
        },
      })
      return questionsWithId.id
    }),
  )

  await Survey.update(
    {
      questionIds: ids,
    },
    { where: { type: 'university' } },
  )
}

const start = async () => {
  await connectToDatabase()
  await createOrganisations()
  await createHYQuestions()
  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()
