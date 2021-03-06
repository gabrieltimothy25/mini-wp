require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose')

const routes = require('./routes/index')
const cors = require('cors')

app.use(express.urlencoded({ extended: false}))
app.use(express.json())
app.use(cors())

// mongoose.connect(process.env.ATLAS_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.connect('mongodb://localhost/miniWP', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(err, success) {
  console.log('Database connection successful')
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/', routes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})