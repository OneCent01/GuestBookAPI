
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

const executeQueries = (conn, queries, cb, i=0) => {
	return handleQuery(conn, queries[i])
		.then(res => (
			i < queries.length-1 
				? executeQuries(conn, queries, cb, i+1) 
				: cb(true)
		))
		.catch(err => cb(false, err))
}


module.exports = { 
	initConnection, 
	killConnection,
	handleQuery,
	executeQueries
}