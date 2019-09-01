const initConnection = (conn) => new Promise((resolve, reject) => {
	conn.connect(err => {
		if(err) {
			reject({success: false, error: err})
		} else {
			resolve({success: true})
		}
	})
})

const killConnection = (conn) => new Promise((resolve, reject) => conn.end(err => resolve(err)))

const handleQuery = (conn, query) => new Promise((resolve, reject) => {
	conn.query(query, (err, rows) => {
		if(err) {
			reject({success: false, error: err}) 
		} else {
			resolve({success: true, data: rows})
		}
	})
})

module.exports = { 
	initConnection, 
	killConnection,
	handleQuery
}