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
        en: 'The learning objectives were clear to me',
      },
    },
    true,
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojakson toteutus tuki oppimistani',
        en: 'The course activies supported my learning',
      },
    },
    true,
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojaksolla käytetyt materiaalit tukivat oppimistani',
        en: 'The material used in the course supported my learning',
      },
    },
    true,
  ],
  [
    'LIKERT',
    {
      label: {
        fi: 'Opintojakson arviointi mittasi oppimistani',
        en:
          'Course assessment measured the achievement of the learning objectives',
      },
    },
    true,
  ],
  [
    'LIKERT',
    { label: { fi: 'Opintojakso oli työläs', en: 'The course was laborious' } },
    true,
  ],
  [
    'OPEN',
    {
      label: {
        fi: 'Muita huomioita',
        en: 'Other comments',
      },
    },
    false,
  ],
]

// eslint-disable-next-line
const createHYQuestions = async () => {
  const ids = []

  /* eslint-disable */
  for (const question of questions) {
    const [questionWithId] = await Question.findOrCreate({
      where: {
        type: question[0],
        data: question[1],
        required: question[2],
      },
      defaults: {
        type: question[0],
        data: question[1],
        required: question[2],
      },
    })
    ids.push(questionWithId.id)
  }
  /* eslint-enable */

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
  // await createHYQuestions()
  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()
