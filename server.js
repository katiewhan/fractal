const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

http.createServer(app).listen(80, () => { console.log("Server listening on port 80") })