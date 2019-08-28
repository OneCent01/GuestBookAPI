const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
	res.send('YOU\'VE ARRIVED AT THE GUESETBOOK API ENDPOINT!')
})


/********* USERS *************/
app.get('/add-user', (req, res) => {
	// TODO
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


/************ ASSOCIATIONS ***************/
app.get('/associate-face', (req, res) => {
	// TODO
})

// no need to associate transactions with customers explicitly, 
// should link it with the customer automatically when it's added


/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))