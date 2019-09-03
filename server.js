const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mysql = require('mysql')

const dotenv = require('dotenv/config');

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
		.then(rows => res.send(`All users: ${JSON.stringify(rows)}`))
		.catch(err => res.send(`Failed to retrieve all users: ${err}`))
})


/********* USERS *************/
app.post('/add-user', (req, res) => {
	addUser(connection, {
		index: 1, 
		email: 'jmnanipenney22+test1@gmail.com', 
		pass: '123'
	})
	.then(addUserRes => {
		getAllUsers(connection)
			.then(rows => res.send(JSON.stringify({success: true, data: rows})))
			.catch(err => res.send(JSON.stringify({success: false, error: err})))
	})
	.catch(err => res.send(JSON.stringify({success: false, error: err})))
})

app.get('/get-user', (req, res) => {
	getUser(connection, {
		index: 1,
	})
	.then(res => {
		console.log(res);
	})
	.catch(err => console.log('Failed to add user: ', err))
})

app.get('/update-user', (req, res) => {
	updateUser(connection, {
        index: 1,
        email: 'jmnanipenney22+test1@gmail.com',
		pass: '456'
	})
	.then(res => {
		console.log(res);
	})
	.catch(err => console.log('Failed to add user: ', err))
})

app.get('/delete-user', (req, res) => {
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