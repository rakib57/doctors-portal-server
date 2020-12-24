const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aea4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const appointmentCollection = client.db("doctorsPortalDB").collection("appointment");
  const doctorCollection = client.db("doctorsPortalDB").collection("doctors");
  console.log('conected')

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    appointmentCollection.find({ date: date.date })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    console.log(name, email,file);
   
    doctorCollection.insertOne({name, email, image})
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/doctors', (req,res) => {
    doctorCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  })

  app.post('/isDoctor', (req,res) => {
    const email = req.body.email;
    doctorCollection.find({email: email })
    .toArray((err, doctors) => {
      res.send(doctors.length > 0)
    }) 
  })

});

app.get('/', (req, res) => {
  res.send('I am very busy to work')
})



app.listen(process.env.PORT || 4200)