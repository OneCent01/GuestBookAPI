const mysql = require('mysql')

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'guestbook'
})

connection.connect(err => console.log(err ? err : 'connection established'))

const initConnection = async () => new Promise((resolve, reject) => {
	connection.connect(err => {
		if(err) {
			reject({success: false, error: err})
		} else {
			resolve({success: true})
		}
	})
})

const killConnection = async () => new Promise((resolve, reject) => connection.end(err => resolve(err)))

const executeQuery = async query => new Promise((resolve, reject) => {
	connection.query(query, (err, rows) => {
		if(err) {
			reject({success: false, error: err}) 
		} else {
			resolve({success: true, data: rows})
		}
	})
})

const handleQuery = async query => {
	const queryRes = await executeQuery(query)

	if(!queryRes.success) {
		return queryRes.error
	} else {
		return queryRes.data
	}
}


module.exports = { handleQuery, initConnection, killConnection }