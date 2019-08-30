const express = require('express')
const app = express()

const port = process.env.PORT || 3000;

const {
	addUser, 
	getAllUsers,
	initGuestBookTables
} = require('./dbQueries.js')


app.get('/', (req, res) => {
	// initGuestBookTables().then(res => console.log('res: ', res)).catch(err => console.log('err: ', err))
	getAllUsers()
		.then(rows => res.send(`All users: ${JSON.stringify(rows)}`))
		.catch(err => res.send(`Failed to retrieve all users: ${err}`))
})


/********* USERS *************/
app.get('/add-user', (req, res) => {
	// TODO
	addUser(1, 'jmpenney22+test1@gmail.com', 'farts1')
		.then(res => {
			console.log('success!')
			getAllUsers()
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