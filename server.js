const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

const port = process.env.PORT || 3000
http.createServer(app).listen(port, () => { console.log(`Server listening on port ${port}`) })