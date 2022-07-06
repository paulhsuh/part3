const express = require('express')
const cors = require('cors')
var morgan = require('morgan')

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const app = express()
app.use(express.json())
app.use(cors())

morgan.token('data', function (req, res) {return JSON.stringify(req.body)})

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
  return persons.find( person => person.name === name)
}

app.get('/', (request, response) => {
  response.send("<h1>Hello world</h1>")
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const info = `
    <p>
    Phonebook has info for ${persons.length} people.
    </p>
    <p>
    ${Date()}
    </p>
  `
  response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find( (person) => person.id === id)

  if (!person) {
    return response.status(404).end()
  }

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter( (person) => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(404).json({error:'no name provided'})
  }
  else if (!body.number) {
    return response.status(404).json({error:'no number provided'})
  }
  else if(duplicateName(body.name)) {
    return response.status(404).json({error:'name must be unique'})
  }

  const person = {
    id: Math.ceil(Math.random() * 100000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))