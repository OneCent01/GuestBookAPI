const mysql = require('mysql')
const dotenv = require('dotenv/config')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

const {
	secureRandomHex,
	hash,
	verify,
	issueToken,
	verifyToken
} = require('./security')

const dbApi = require('./database/dbQueries.js')
const { initAndCreatDbIfNone } = require('./initDatabase.js')
const { fetchProductData } = require('./scrapeProdData.js')

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
.catch(err => alert(`ERROR INITIALIZING THE DATABASE: ${err}`))

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

const unrestrictedPaths = ['/auth-user', '/add-user']

// every request will be passed through this endpoint,
// to check the senders credentials (token) and possibly  
// terminate the endpoint fallthrough
app.use('', (req, res, next) => {
	const path = req.path 
	// if the use is attempting to ping one of the unrestricted
	// endpoints, let them through. Otherwise, 
	if(!unrestrictedPaths.includes(path)) {
		const headers = req.headers
		const token = headers.authorization
		// check the whether the token was sent in and if it's valid
		const isValid = (token && token.length && verifyToken(token))
		if(isValid && isValid.success) {
			// attach the user data to the request object passed 
			// to the next endpoint
			req.user = isValid.user.id
			next()
		} else {
			res.send(JSON.stringify({
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
		try {
			const addUserRes = await dbApi.addUser(connection, opts)
			res.send(JSON.stringify(addUserRes))

		} catch(e) {
			res.send(JSON.stringify(e))

		}
	} else {
		res.send(JSON.stringify({
			success: false, 
			error: 'INVALID EMAIL FORMAT, MUST CONFORM TO THE STRUCTURE: _@_._'
		}))
	}
})

app.post('/auth-user', async (req, res) => {
	const reqData = req.body

	try {
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

	} catch(e) {
		res.send(JSON.stringify({success: false}))
	}
})

// this array of objects determines the queries executed to get 
// the user data on login. Designed for flexibility and scalability;
// as out the variety of data we collect grows and changes, we can
// add or remove query objects from this array to get different results.

app.get('/user-data', async (req, res) => {
	const user = req.user
	const user_id = user.id

	try {
		const results = await dbApi.getUserData(connection, { user_id })
		console.log('results: ', results)
		res.send(JSON.stringify(results))
	} catch(e) {
		res.send(JSON.stringify(e))
	}
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


/************ PRODUCTS ****************/
const msPerDay = (1000 * 60 * 60 * 24)
const updateDaysInterval = 90
const updateInterval = msPerDay * updateDaysInterval
app.get('/scan-product/:barcode?', async (req, res) => {
	const barcode = req.query.barcode

	const productLookup = await dbApi.getProducts(connection, {barcodes: [barcode]})
	const noProductData = productLookup.data.length === 0
	const timeForUpdate = productLookup.data.lastLookup < (Date.now() - updateInterval)
	const productScrapeRequired = (
		noProductData
		|| timeForUpdate
	)

	if(productScrapeRequired) {
		const productDataRes = await fetchProductData(barcode)

		if(
			!productDataRes.titles 
			|| productDataRes.titles.length === 0
		) {
			res.send(JSON.stringify({success: false, error: 'NO TITLES FOUND'}))
			return
		}

		try {
			const prodOpts = {...productDataRes, barcode}
			const productExists = (
				productLookup.success 
				&& productLookup.data
				&& productLookup.data.length
			)
			// to add a product, first add the product to the products table,
			const productAddedRes = await (
				productExists
					? dbApi.updateProduct(connection, prodOpts)
					: dbApi.addProduct(connection, prodOpts)
			)

			if(!productAddedRes.success) {
				res.send(JSON.stringify(productAddedRes))
				return
			}

			const updatedProductLookup = await dbApi.getProducts(connection, {barcodes: [barcode]})
			if(
				updatedProductLookup.success
				&& updatedProductLookup.data
				&& updatedProductLookup.data.length
			) {
				const updatedProduct = updatedProductLookup.data[0]
				// then add the product's images to the images table
				// the product is saved in the DB now; this boolean 
				// indicates that we just made it, so we know images 
				// need to be added and associated with the user:
				if(!productExists) {
					const addTitlesRes = await dbApi.addTitles(connection, {
						product_id: updatedProduct.id,
						titles: productDataRes.titles
					})
					if(!addTitlesRes.success) {
						res.send(JSON.stringify(addTitlesRes))
						return
					}

					if(productDataRes.images.length) {
						const addImagesRes = await dbApi.addImages(connection, {
							product_id: updatedProduct.id,
							images: productDataRes.images
						})
						if(!addImagesRes.success) {
							res.send(JSON.stringify(addImagesRes))
							return
						}
					}
				}
			}

			res.send(JSON.stringify(updatedProductLookup))

		} catch(e) {
			res.send(JSON.stringify(e))
		}
	}

})

app.put('/update-product', async (req, res) => {
	const reqData = req.body
	const opts = {
		product_id: reqData.product_id,
		attrs: reqData.attrs
	}
	res.send(JSON.stringify(await dbApi.updateProduct(connection, opts)))
})


/********** USER PRODUCTS *************/
app.post('/add-user-product', async (req, res) => {
	const reqData = req.body
	const barcode = reqData.barcode
	const product_id = reqData.product_id
	const product_stock = reqData.stock
	const user = req.user

	try {
		const productLookup = await dbApi.getUserProducts(
			connection, 
			{user_id: user.id}
		)
	
		const queryOptions = {
			user_id: user.id,
			product_id: product_id,
			stock: product_stock
		}
		const upsertUserProductRes = await (
			(
				productLookup.success 
				&& productLookup.data 
				&& productLookup.data.length
			)
			? dbApi.updateUserProduct(connection, queryOptions)
			: dbApi.addUserProduct(connection, queryOptions)
		)
	
		console.log('upsertUserProductRes: ',upsertUserProductRes)
		
		res.send(JSON.stringify(upsertUserProductRes))

	} catch(e) {
		res.send(JSON.stringify(e))
	}
})


/*********** START THE SERVER ************/
const server = app.listen(port, () => console.log(`Listening on port ${port}...`))