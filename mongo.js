
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument. node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.xt9zy.mongodb.net/phonebook?retryWrites=true&w=majority`

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Phone = mongoose.model('Phone', phoneSchema)

mongoose
  .connect(url)
  .then( () => {
    if (process.argv[3] && process.argv[4]) {
      const name = process.argv[3]
      const number = process.argv[4]
      const newPhone = new Phone({
        name: name,
        number: number
      })
      newPhone
        .save()
        .then( () => {
          console.log(`added ${name} number ${number} to phonebook`)
          mongoose.connection.close()
        })
    }
    else {
      Phone
        .find({})
        .then( result => {
          return result.map( (phone) => `${phone.name} ${phone.number}`)
        })
        .then( lines => {
          console.log('phonebook:')
          console.log(lines.join('\n'))
          mongoose.connection.close()
        })
    }
  })
  .catch( (error) => {
    console.log(error)
  })