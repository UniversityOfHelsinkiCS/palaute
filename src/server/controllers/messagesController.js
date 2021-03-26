const { ApplicationError } = require('../util/customErrors')

/**
 * Simple example for backend
 */
let messages = []
let simpleId = 0

const getAll = async (req, res) => {
  res.send(messages)
}

const create = async (req, res) => {
  const newMessage = {
    id: simpleId,
    body: req.body.message,
  }
  messages.push(newMessage)
  res.send(newMessage)
  simpleId += 1
}

const getOne = async (req, res) => {
  const message = messages.find((m) => m.id === req.params.id)
  if (!message) throw new ApplicationError('Not found', 404)

  res.send(message)
}

const update = async (req, res) => {
  const message = messages.find((m) => m.id === req.params.id)
  message.body = req.body.message
  messages = messages.filter((m) => m.id === message.id)
  messages.push(message)
  res.send(message)
}

const destroy = async (req, res) => {
  messages = messages.filter((m) => m.id === req.params.id)
  res.sendStatus(200)
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  destroy,
}
