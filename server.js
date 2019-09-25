const {
	secureRandomHex,
	hash,
	verify,
	issueToken,
	verifyToken
} = require('./security')

const dbApi = require('./dbQueries.js')

const { initAndCreatDbIfNone } = require('./initDatabase.js')

const { fetchProductData } = require('./scrapeProdData.js')

const mysql = require('mysql')
const dotenv = require('dotenv/config')

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

const cors = require('cors')

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

// very simple email format validation ensuring the email is in in the form: _@_._
// anything more restrictive than that is too opinionated
const emailIsValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/********** MIDDLEWARE ***************/

app.use(cors({
	credentials: true, 
	origin: ['http://localhost:8080', 'http://localhost:8081']
}))

// I guess we need both of these middleware parsers to be able to 
// see the body in a post request... OK
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const noAuthRequiredPahts = ['/auth-user', '/add-user']

app.use('', (req, res, next) => {
	const path = req.path 

	if(!noAuthRequiredPahts.find(openPath => path.includes(openPath))) {
		const headers = req.headers
		const token = headers.authorization
		const isValid = (token && token.length && verifyToken(token))
		if(isValid && isValid.success) {
			req.user = isValid.user
			next()
		} else {
			res.send(JOSN.stringify({
				success: false, 
				error: 'INVALID TOKEN'
			}))
		}
	} else {
		next()
	}

})

/********** ROOT **************/
app.get('/', async (req, res) => res.send(JSON.stringify({res: 'OK'})))


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
		res.send(JSON.stringify(await dbApi.addUser(connection, opts)))
	} else {
		res.send(JSON.stringify({
			success: false, 
			error: 'INVALID EMAIL FORMAT, MUST CONFORM TO THE STRUCTURE: _@_._'
		}))
	}

})

app.post('/auth-user', async (req, res) => {
	const reqData = req.body

	const userRes = await dbApi.getUser(connection, {email: reqData.email})
	if(!userRes.data || userRes.data.length === 0) {
		res.send(JSON.stringify({success: false}))
		return
	}
	const user = userRes.data[0]
	const saltedPass = `${user.salt}${reqData.password}`
	const verified = await verify(saltedPass, user.hash)

	if(verified) {
		issueToken(user)
		.then(token => res.send(JSON.stringify({
			success: true, 
			token: token
		})))
		.catch(err => res.send(JSON.stringify({success: false})))
		
	} else {
		res.send(JSON.stringify({success: false}))
	}
})

// this array of objects determines the queries executed to get 
// the user data on login. Designed for flexibility and scalability;
// as out the variety of data we collect grows and changes, we can
// add or remove query objects from this array to get different results.
const getDataQueries = [
	{
		query: dbApi.getUserProducts,
		dataKey: 'userProductData'
	}
]
app.get('/user-data', async (req, res) => {
	const user = req.user.id
	const user_id = user.id

	// each query is a promise, so lets execute them concurrently,  
	// then resolve once all of them resolve: 
	const results = await Promise.all(
		// iterate over evry queryObject
		getDataQueries.map( 
			// wrap the promise in a promise.. I know, kind of messy, 
			// but necessary to add additional meta-data
			// to the resolved response from the query... 
			// we wante to let data union operation on the results
			// to have a key for every data array returned, otherwise 
			// we'll end up with a bunch of unlabelled arrays
			queryObj => new Promise(
				async (resolve, reject) => {
					const queryRes = await queryObj.query(connection, { user_id })
					resolve({
						dataKey: queryObj.dataKey,
						data: queryRes.success ? queryRes.data : queryRes.error,
						success: queryRes.success
					})
				}
			)
		)
	)
	
	const unitedData = results.reduce((final, result) => {
		if(result.success) {
			final.data[result.dataKey] = result.data
		} else {
			final.success = false
			final.errors = (
				final.errors 
					? [...final.errors, result.data] 
					: [result.data]
			)
		}
		return final
	}, {success: true, data: {}})

	res.send(JSON.stringify(unitedData))
})


app.get('/get-user/:email?/:id?', async (req, res) => {
	const opts = (
		req.query.id ? {id: req.query.id}
		: req.query.email ? {email: req.query.email}
		: {id: 1}
	)
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.put('/update-user', async (req, res) => {
	const reqData = req.body
	const opts = {
        id: reqData.id,
        email: reqData.email,
		pass: reqData.password
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.delete('/delete-user', async (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.id
	}

	// should add a validation step where the password needs to be sent in 
	// and compared against that stored in the database
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

/************ TRANSACTIONS ***************/
app.post('/add-transaction', async (req, res) => {
	const reqData = req.body
	const opts = {
		user_id: reqData.user_id,
		data: reqData.data
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.get('/get-transactions/:user_id?', async (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.delete('/delete-transaction', async (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.transaction_id
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

/************ CUSTOMERS ***************/
app.post('/add-customer', async (req, res) => {
	const reqData = req.body
	const opts = {
		user_id: reqData.user_id
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.get('/get-customers/:user_id?', async (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})

app.put('/update-customers', async (req, res) => {
	// TODO
})

app.delete('/delete-customers', async (req, res) => {
	const reqData = req.body
	const opts = {
		id: reqData.id
	}
	res.send(JSON.stringify(await dbApi.getUser(connection, opts)))
})


/************ PRODUCTS ****************/
const msPerDay = (1000 * 60 * 60 * 24)
app.get('/scan-product/:barcode?', async (req, res) => {
	const barcode = req.query.barcode

	const productLookup = await dbApi.getProducts(connection, {barcodes: [barcode]})
	if(
		!productLookup.success 
		|| productLookup.data.length === 0
		|| productLookup.data.lastLookup < (Date.now() - (msPerDay * 90))
	) {

		const productDataRes = await fetchProductData(barcode)

		try {
			const prodOpts = {...productDataRes, barcode}
			const productAddedRes = await (
				(productLookup.success && productLookup.data.length)
					? dbApi.updateProduct(connection, prodOpts)
					: dbApi.addProduct(connection, prodOpts)
			)

			if(!productAddedRes.success) {
				res.send(JSON.stringify(productAddedRes))
				return
			} 

		} catch(e) {
			res.send(JSON.stringify(e))
			return
		}
	}

	const updatedProductLookup = await dbApi.getProducts(connection, {barcodes: [barcode]})
	res.send(JSON.stringify(updatedProductLookup))
})

app.get('/get-product/:ids?', async (req, res) => {
	const opts = {
		product_ids: req.query.ids.split('|')
	}
	res.send(JSON.stringify(await dbApi.getProducts(connection, opts)))
})

app.put('/update-product', async (req, res) => {
	const reqData = req.body
	const opts = {
		product_id: reqData.product_id,
		attrs: reqData.attrs
	}
	res.send(JSON.stringify(await dbApi.updateProduct(connection, opts)))
})

app.delete('/delete-product', async (req, res) => {
	const reqData = req.body
	const opts = {
		product_id: reqData.product_id
	}
	res.send(JSON.stringify(await dbApi.deleteProduct(connection, opts)))
})


/********** USER PRODUCTS *************/
app.post('/add-user-product', async (req, res) => {
	const reqData = req.body
	const barcode = reqData.barcode

	const userProductLookup = await dbApi.getUserProduct(connection, {barcode})

	const upsertUserProductRes = await (
		userProductLookup.success
		? dbApi.updateUserProduct(connection, {/*TODO*/})
		: dbApi.addUserProduct(connection, {/*TODO*/})
	)
	
	if(!upsertUserProductRes.success) {
		res.send(JSON.stringify(upsertUserProductRes))
	} else {
		const updatedUserProductLookup = await dbApi.etUserProduct(connection, {barcode})
		res.send(JSON.stringify(updatedUserProductLookup))
	}
})

app.get('/get-user-products/:user_id?', async (req, res) => {
	const opts = {
		user_id: req.query.user_id
	}
	res.send(JSON.stringify(await dbApi.getUserProducts(connection, opts)))
})

app.put('/update-user-product', async (req, res) => {
	const reqData = req.body
	const opts = {
		user_product_id: reqData.user_product_id,
		attrs: reqData.attrs
	}
	res.send(JSON.stringify(await dbApi.updateUserProduct(connection, opts)))
})

app.delete('/delete-user-product', async (req, res) => {
	const reqData = req.body
	const opts = {
		user_product_id: reqData.user_product_id
	}
	res.send(JSON.stringify(await dbApi.deleteUserProduct(connection, opts)))
})

/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))