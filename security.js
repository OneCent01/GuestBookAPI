const crypto = require('crypto')
const secureRandomHex = (length) => new Promise((resolve, reject) => {
	crypto.randomBytes(Math.ceil(length/2), (err, buff) => {
		if(err !== null) {
			reject(err)
		} else {
			const randHex = buff.toString('hex')
			resolve(randHex.slice(0, length)) 
			// just use the hex.. probably more secure anyway.
			// const randInt = parseInt(randHex, 16)
			// resolve(+randInt.toString().slice(0, length))
		}
	})
})

const argon2 = require('argon2')
const hash = (saltedPass) => new Promise(async (resolve, reject) => resolve(await argon2.hash(saltedPass)))
const verify = (saltedPass, hash) => new Promise(async (resolve, reject) => resolve(await argon2.verify(hash, saltedPass)))


const  jwt  =  require('jsonwebtoken');
const SECRET_KEY = "secretkey23456";
const getAccessToken = (user) => new Promise((resolve, reject) => {
	const expiresIn = 24 * 60 * 60;
	const accessToken = jwt.sign(
		{ id:  user }, 
		SECRET_KEY, 
		{ expiresIn }
	);

	resolve(accessToken)
})

module.exports = {
	secureRandomHex,
	hash,
	verify,
	getAccessToken
}