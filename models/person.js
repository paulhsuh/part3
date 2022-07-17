const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

function isPositiveInt(input) {

  const number = Number(input);
  if (Number.isInteger(number) && number > 0) {
    return true;
  }
  return false;
}

mongoose
  .connect(url)
  .then(result => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate:{ 
      validator: function (v) {
        const parts = v.split("-")
        if (parts.length === 2) {
          const partOne = parts[0]
          const partTwo = parts[1]
          if (partOne.length === 2 || partOne.length === 3) {
            return isPositiveInt(partOne) && isPositiveInt(partTwo)
          }
        }
        return false
      },
    }, 
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person
