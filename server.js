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
    updateUser,
	deleteUser,
	addFace,
	getFaces,
	addTransaction,
	getTransactions,
	addCustomer,
	getCustomers,
	deleteCustomer
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
		.then(getAllUsers_res => res.send(JSON.stringify(getAllUsers_res)))
		.catch(err => res.send(JSON.stringify(err)))
})


/********* USERS *************/
app.post('/add-user', (req, res) => {
	const addUserData = req.body

	addUser(connection, {
		email: addUserData.email, 
		pass: addUserData.password
	})
	.then(addUserRes => res.send(JSON.stringify(addUserRes)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.get('/get-user/:email?/:id?', (req, res) => {
	const lookup = (
		req.query.id ? {id: req.query.id}
		: req.query.email ? {email: req.query.email}
		: {id: 1}
	)

	getUser(connection, lookup)
	.then(getUser_res => res.send(JSON.stringify(getUser_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.put('/update-user', (req, res) => {
	const updateUserData = req.body
	updateUser(connection, {
        id: updateUserData.id,
        email: updateUserData.email,
		pass: updateUserData.password
	})
	.then(updateUser_res => res.send(JSON.stringify(updateUser_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.delete('/delete-user', (req, res) => {
	const deleteUserData = req.body
	// should add a validation step where the password needs to be sent in 
	// and compared against that stored in the database
	deleteUser(connection, {
		id: deleteUserData.id
	})
	.then(deleteUser_res => res.send(JSON.stringify(deleteUser_res)))
	.catch(err => res.send(JSON.stringify(err)))
})


/************ FACES ***************/
app.post('/add-face', (req, res) => {
	const addFaceData = req.body

	addFace(connection, {
		user_id: addFaceData.user_id,
		image_path: addFaceData.image_path
	})
	.then(addFace_res => res.send(JSON.stringify(addFace_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.get('/get-faces/:user_id?', (req, res) => {
	getFaces(connection, {
		user_id: req.query.user_id
	})
	.then(getFaces_res => res.send(JSON.stringify(getFaces_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

// shouldn't ever need to update or delete faces...


/************ TRANSACTIONS ***************/
app.post('/add-transaction', (req, res) => {
	const addTransactionData = req.body

	addTransaction(connection, {
		user_id: addTransactionData.user_id,
		data: addTransactionData.data
	})
	.then(addTransaction_res => res.send(JSON.stringify(addTransaction_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.get('/get-transactions/:user_id?', (req, res) => {
	getTransactions(connection, {
		user_id: req.query.user_id
	})
	.then(getTransactions_res => res.send(JSON.stringify(getTransactions_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

// shouldn't ever need to update or delete transactions...

/************ CUSTOMERS ***************/
app.post('/add-customer', (req, res) => {
	const addCustomerData = req.body
	addCustomer(connection, {
		user_id: addCustomerData.user_id
	})
	.then(addCustomer_res => res.send(JSON.stringify(addCustomer_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.get('/get-customers/:user_id?', (req, res) => {
	getCustomers(connection, {
		user_id: req.query.user_id
	})
	.then(getCustomers_res => res.send(JSON.stringify(getCustomers_res)))
	.catch(err => res.send(JSON.stringify(err)))
})

app.put('/update-customers', (req, res) => {
	// TODO
})

app.delete('/delete-customers', (req, res) => {
	const deleteCustomerData = req.body
	deleteCustomer(connection, {
		id: deleteCustomerData.id
	})
	.then(deleteCustomers_res => res.send(JSON.stringify(deleteCustomers_res)))
	.catch(err => res.send(JSON.stringify(err)))
})



/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))