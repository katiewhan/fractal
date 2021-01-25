import * as express from 'express'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import * as http from 'http'
// import * as https from 'https'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

const port = process.env.PORT || 80
http.createServer(app).listen(port, () => { console.log(`Server listening on port ${port}`) })