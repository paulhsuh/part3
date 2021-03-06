require('dotenv').config()
const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('data', function (req) {return JSON.stringify(req.body)})

app.use(morgan(function (tokens, req, res) {
  const log = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]
  if (req.method === 'POST'){
    log.push(tokens.data(req, res))
  }
  return log.join(' ')
}))

const duplicateName = (name) => {
  let duplicated
  Person
    .findOne({ name: name })
    .then( (person) => duplicated = Boolean(person))
    .catch( error => console.error(error.message))
  return duplicated
}

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(notes => response.json(notes))
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person
    .count()
    .then( length => {
      const info = `
      <p>
      Phonebook has info for ${length} people.
      </p>
      <p>
      ${Date()}
      </p>
      `
      response.send(info)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findById(id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }
      response.json(person)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findByIdAndRemove(id)
    .then( () => response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body
  const newPerson = {
    name: body.name,
    number: body.number
  }
  Person
    .findByIdAndUpdate(id, newPerson, { new: true, runValidators: true, context: 'query' })
    .then( (result) => response.json(result))
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(404).json({ error:'no name provided' })
  }
  else if (!body.number) {
    return response.status(404).json({ error:'no number provided' })
  }
  else if(duplicateName(body.name)){
    return response.status(404).json({ error:'name must be unique' })
  }

  const person =new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then( (savedPerson) => response.json(savedPerson))
    .catch (error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))