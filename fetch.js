const https = require('https')

const fetch = (method, url, payload=undefined) => new Promise((resolve, reject) => {
	https.get(
		url,
		res => {
			const dataBuffers = []
			res.on('data', data => dataBuffers.push(data.toString('utf8')))
			res.on('end', () => resolve(dataBuffers.join('')))
		}
	).on('error', reject)
})

module.exports = {fetch}