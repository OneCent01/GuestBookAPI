const express = require('express')
const app = express()

const mysql = require('mysql')

const port = process.env.PORT || 3000;

const {
	addUser, 
	getAllUsers
} = require('./dbQueries.js')

const {
	initAndCreatDbIfNone
} = require('./initDatabase.js')

// these options here are what we change to configure connections to 
// mySQL databases, including external ones
const connectionOps = {
	host: 'localhost',
	user: 'root',
	password: '123456'
}

let connection = mysql.createConnection({
	...connectionOps,
	database: 'guestbook'
})

initAndCreatDbIfNone(connection, connectionOps)


/********** ROOT **************/
app.get('/', (req, res) => {
	getAllUsers(connection)
		.then(rows => res.send(`All users: ${JSON.stringify(rows)}`))
		.catch(err => res.send(`Failed to retrieve all users: ${err}`))
})


/********* USERS *************/
app.get('/add-user', (req, res) => {
	addUser(connection, {
		index: 1, 
		email: 'jmpenney22+test1@gmail.com', 
		pass: '123'
	})
	.then(res => {
		console.log('Success! User added.')
		getAllUsers(connection)
			.then(rows => console.log('user rows: ', rows))
			.catch(err => console.log('Failed to retrieve all users: ', err))
	})
	.catch(err => console.log('Failed to add user: ', err))
})

app.get('/get-user', (req, res) => {
	// TODO
})

app.get('/update-user', (req, res) => {
	// TODO
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