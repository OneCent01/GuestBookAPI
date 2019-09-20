const {
	secureRandomHex,
	hash,
	verify
} = require('./security')

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
	deleteTransaction,
	addCustomer,
	getCustomers,
	deleteCustomer,
	addProduct,
	getProducts,
	updateProduct,
	deleteProduct,
	addUserProduct,
	getUserProducts,
	updateUserProduct,
	deleteUserProduct
} = require('./dbQueries.js')

const {
	initAndCreatDbIfNone
} = require('./initDatabase.js')

const mysql = require('mysql')
const dotenv = require('dotenv/config');

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

// Disable CORS for now for easier development...
// comment out before in production for security reasons
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// I guess we need both of these middleware parsers to be able to 
// see the body in a post request... OK
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// these options here are what we change to configure connections to 
// mySQL databases, including external ones
const connectionOps = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD
}

// INITIALIZE CONNECTION OPTS, MAY NEED TO CHANGE IF 
// GUESTBOOK ISN'T CURRENTLY A DB IN THE MYSQL DB
const dataBase = process.env.DB_DATABASE
let connection = mysql.createConnection({
	...connectionOps,
	database: process.env.DB_DATABASE
})

// DATABASE CONNECTION INITIALIZATION
initAndCreatDbIfNone(connection, connectionOps, dataBase)
.then(conn => { connection = conn })
.catch(err => {})


// UTIL FUNCTIONS
const exexuteDbQueryAndForwardRes = (res, queryFn, opts) => {
	queryFn(connection, opts)
		.then(queryRes => res.send(JSON.stringify(queryRes)))
		.catch(err => res.send(JSON.stringify(err)))
}

// very simple email format validation ensuring the email is in in the form: _@_._
// anything more restrictive than that is too opinionated
const emailIsValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/********** ROOT **************/
app.get('/', async (req, res) => res.send('OK'))


/********* USERS *************/
app.post('/add-user', async (req, res) => {
	const reqData = req.body
	if(emailIsValid(reqData.email)) {
		const salt = await secureRandomHex(16)
		const hashed = await hash(`${salt}${reqData.password}`)
		
		const opts = {
			email: reqData.email, 
			salt: salt,
			hash: hashed
		}
		exexuteDbQueryAndForwardRes(res, addUser, opts)
	} else {
		res.send(JSON.stringify({success: false, error: 'INVALID EMAIL FORMAT, MUST CONFORM TO THE STRUCTURE: _@_._'}))
		return
	}

})

app.post('/auth-user', async (req, res) => {
	const reqData = req.body

	const userRes = await getUser(connection, {email: reqData.email})
	const user = userRes.data[0]
	const verified = await verify(`${user.salt}${reqData.password}`, user.hash)

	res.send(JSON.stringify({success: verified}))
})

app.get('/get-user/:email?/:id?', (req, res) => {
	const opts = (
		req.query.id ? {id: req.query.id}
		: req.query.email ? {email: req.query.email}
		: {id: 1}
	)
	exexuteDbQueryAndForwardRes(res, getUser, opts)
})

app.put('/update-user', (req, res) => {
	const reqData = req.body
	const opts = {
        id: reqData.id,
        email: reqData.email,
		pass: reqData.password
	}
	exexuteDbQueryAndForwardRes(res, updateUser, opts)
})

app.delete('/delete-user', (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.id
	}

	// should add a validation step where the password needs to be sent in 
	// and compared against that stored in the database
	exexuteDbQueryAndForwardRes(res, deleteUser, opts)
})

/************ TRANSACTIONS ***************/
app.post('/add-transaction', (req, res) => {
	const reqData = req.body
	const opts = {
		user_id: reqData.user_id,
		data: reqData.data
	}
	exexuteDbQueryAndForwardRes(res, getFaces, opts)
})

app.get('/get-transactions/:user_id?', (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	exexuteDbQueryAndForwardRes(res, getTransactions, opts)
})

app.delete('/delete-transaction', (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.transaction_id
	}
	exexuteDbQueryAndForwardRes(res, deleteTransaction, opts)
})

// shouldn't ever need to update or delete transactions...

/************ CUSTOMERS ***************/
app.post('/add-customer', (req, res) => {
	const reqData = req.body
	const opts = {
		user_id: reqData.user_id
	}
	exexuteDbQueryAndForwardRes(res, addCustomer, opts)
})

app.get('/get-customers/:user_id?', (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	exexuteDbQueryAndForwardRes(res, getCustomers, opts)
})

app.put('/update-customers', (req, res) => {
	// TODO
})

app.delete('/delete-customers', (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.id
	}
	exexuteDbQueryAndForwardRes(res, deleteCustomer, opts)
})


/************ PRODUCTS ****************/
app.post('/add-product', (req, res) => {
	const reqData = req.body
	const opts = {
		category: reqData.category,
		barcode: reqData.barcode,
		desc: reqData.description,
		img_urls: reqData.img_urls,
		price_data: reqData.price_data
	}
	exexuteDbQueryAndForwardRes(res, addProduct, opts)
})

const {fetchProductData} = require('./scrapeProdData.js')

app.get('/scan-product/:barcode?', (req, res) => {
	const barcode = req.query.barcode
	// before we do this, we should check to see if the product already 
	// exists in the database and when the last update scan was... 
	// if it's been over a year since the last scan, perform it again and update the data
	fetchProductData(barcode)
	.then(res => console.log('res: ', res))
	.catch(err => console.log('errr: ', err))
})

app.get('/get-product/:ids?', (req, res) => {
	const opts = {
		product_ids: req.query.ids.split('|')
	}
	exexuteDbQueryAndForwardRes(res, getProducts, opts)
})

app.put('/update-product', (req, res) => {
	const reqData = req.body
	const opts = {
		product_id: reqData.product_id,
		attrs: reqData.attrs
	}
	exexuteDbQueryAndForwardRes(res, updateProduct, opts)
})

app.delete('/delete-product', (req, res) => {
	const reqData = req.body
	const opts = {
		product_id: reqData.product_id
	}
	exexuteDbQueryAndForwardRes(res, deleteProduct, opts)
})


/********** USER PRODUCTS *************/
app.post('/add-user-product', (req, res) => {
	const reqData = req.body
	const opts = {
		user_id: reqData.user_id,
		product_id: reqData.product_id,
		stock: reqData.stock,
		price: reqData.price,
		history: reqData.history
	}
	exexuteDbQueryAndForwardRes(res, addUserProduct, opts)
})

app.get('/get-user-products/:user_id?', (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	exexuteDbQueryAndForwardRes(res, getUserProducts, opts)
})

app.put('/update-user-product', (req, res) => {
	const reqData = req.body
	const opts = {
		user_product_id: reqData.user_product_id,
		attrs: reqData.attrs
	}
	exexuteDbQueryAndForwardRes(res, updateUserProduct, opts)
})

app.delete('/delete-user-product', (req, res) => {
	const reqData = req.body
	const opts = {
		user_product_id: reqData.user_product_id
	}
	exexuteDbQueryAndForwardRes(res, deleteUserProduct, opts)
})


/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))