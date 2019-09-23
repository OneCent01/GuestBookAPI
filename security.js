const crypto = require('crypto')
const secureRandomHex = (length) => new Promise((resolve, reject) => {
	crypto.randomBytes(Math.ceil(length/2), (err, buff) => {
		if(err !== null) {
			reject(err)
		} else {
			// just use the hex.. probably more secure anyway.
			const randHex = buff.toString('hex')
			resolve(randHex.slice(0, length)) 
			// const randInt = parseInt(randHex, 16)
			// resolve(+randInt.toString().slice(0, length))
		}
	})
})

const argon2 = require('argon2')
const hash = (saltedPass) => new Promise(async (resolve, reject) => resolve(await argon2.hash(saltedPass)))
const verify = (saltedPass, hash) => new Promise(async (resolve, reject) => resolve(await argon2.verify(hash, saltedPass)))


const jwt  =  require('jsonwebtoken')
const SECRET_KEY = "secretkey23456"
const expiresIn = 24 * 60 * 60
const issueToken = (id) => new Promise((resolve, reject) => {
	const accessToken = jwt.sign(
		{ 
			id 
		}, // paylod
		SECRET_KEY, // private key
		{ expiresIn } // sign options
	)

	resolve(accessToken)
})

var base64 = {
	encode: unencoded => Buffer.from(unencoded || '').toString('base64'),
	decode: encoded => Buffer.from(encoded || '', 'base64').toString('utf8'),
	urlEncode: unencoded => base64.encode(unencoded).replace('\+', '-').replace('\/', '_').replace(/=+$/, ''),
	urlDecode: encoded => base64.decode(`${encoded.replace('-', '+').replace('_', '/')}${new Array(encoded % 4).fill('=').join('')}`)
};

const verifyToken = (token) => {
	try {
		const decodedToken = jwt.verify(token, SECRET_KEY, { expiresIn })
		const payload = base64.urlEncode(JSON.stringify(decodedToken))
		const headers = base64.urlEncode(JSON.stringify({
			"alg": "HS256",
			"typ": "JWT"
		}))
		const tokenSig = token.split('.')[2]
		const signiature = crypto.createHmac('SHA256', SECRET_KEY)
		.update(`${headers}.${payload}`).digest('base64')
		.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

		return signiature === tokenSig
	} catch(e) {
		return false
	}
}

module.exports = {
	secureRandomHex,
	hash,
	verify,
	issueToken,
	verifyToken
}