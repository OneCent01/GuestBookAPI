const mysql = require('mysql')
const dotenv = require('dotenv/config');

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000


// Disable CORS for now for easier development...
// comment out before in production for security reasons
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// I guess we need both of these middleware parsers to be able to 
// see the body in a post request... OK
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const {
	addUser, 
	getAllUsers,
    getUser,
    updateUser
} = require('./dbQueries.js')

const {
	initAndCreatDbIfNone
} = require('./initDatabase.js')

// these options here are what we change to configure connections to 
// mySQL databases, including external ones
const connectionOps = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD
}

// INITIALIZE CONNECTION OPTS, MAY NEED TO CHANGE IF 
// GUESTBOOK ISN'T CURRENTLY A DB IN THE MYSQL DB
let connection = mysql.createConnection({
	...connectionOps,
	database: process.env.DB_DATABASE
})

// DATABASE CONNECTION INITIALIZATION
initAndCreatDbIfNone(connection, connectionOps)
.then(() => console.log('Connected...'))
.catch(err => console.log(`initAndCreatDbIfNone error: ${err}`))


/********** ROOT **************/
app.get('/', (req, res) => {
	getAllUsers(connection)
		.then(rows => res.send(JSON.stringify({success: true, data: rows})))
		.catch(err => res.send(JSON.stringify({success: false, error: err})))
})


/********* USERS *************/
app.post('/add-user', (req, res) => {
	const addUserData = req.body
	console.log('addUserData: ', addUserData)
	addUser(connection, {
		email: addUserData.email, 
		pass: addUserData.password
	})
	.then(addUserRes => res.send(JSON.stringify({success:true, response: addUserRes})))
	.catch(err => res.send(JSON.stringify({success:false, error: err})))
})

app.get('/get-user/:email?/:index?', (req, res) => {
	const lookup = (
		req.query.index ? {index: req.query.index}
		: req.query.email ? {email: req.query.email}
		: {index: 1}
	)
	getUser(connection, lookup)
	.then(getUser_res => res.send(JSON.stringify({success: true, data: getUser_res})))
	.catch(err => res.send(JSON.stringify({success: false, error: err})))
})

app.post('/update-user', (req, res) => {
	updateUser(connection, {
        index: 1,
        email: 'jmnanipenney22+test1@gmail.com',
		pass: '456'
	})
	.then(res => res.send(JSON.stringify({success: true, data: res})))
	.catch(err => res.send(JSON.stringify({success: false, error: err})))
})

app.post('/delete-user', (req, res) => {
	// TODO
})


/************ FACES ***************/
app.get('/add-face', (req, res) => {
	// TODO
})

app.get('/get-face', (req, res) => {
	// TODO
})

app.get('/get-faces', (req, res) => {
	// TODO
})

// shouldn't ever need to update or delete faces...


/************ TRANSACTIONS ***************/
app.get('/add-transaction', (req, res) => {
	// TODO
})

app.get('/get-transaction', (req, res) => {
	// TODO
})

app.get('/get-transactions', (req, res) => {
	// TODO
})

// shouldn't ever need to update or delete transactions...

/************ CUSTOMERS ***************/
app.get('/add-customer', (req, res) => {
	// TODO
})

app.get('/get-customer', (req, res) => {
	// TODO
})

app.get('/get-customers', (req, res) => {
	// TODO
})

app.get('/update-customers', (req, res) => {
	// TODO
})

app.get('/delete-customers', (req, res) => {
	// TODO
})



/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))