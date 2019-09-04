const initConnection = (conn) => new Promise((resolve, reject) => {
	conn.connect(err => {
		if(err) {
			reject({success: false, error: err})
		} else {
			resolve({success: true})
		}
	})
})

const killConnection = (conn) => new Promise((resolve, reject) => conn.end(resolve))

const handleQuery = (conn, query) => new Promise((resolve, reject) => {
	conn.query(query, (err, rows) => (
		err !== null 
		? reject({success: false, error: err}) 
		: resolve({success: true, data: rows})
	))
})

const handleQueries = (conn, queries, cb, i=0, responses=[]) => {
	return handleQuery(conn, queries[i])
		.then(res => (
			i < queries.length-1 
				? handleQueries(conn, queries, cb, i+1, [...responses, res]) 
				: cb(true, responses)
		))
		.catch(err => cb(false, err))
}

const executeQueries = (conn, queries) => new Promise((resolve, reject) => {
	handleQueries(
		conn,
		queries,
		(success, res) => success ? resolve(res) : reject(res)
	)
})

module.exports = { 
	initConnection, 
	killConnection,
	handleQuery,
	executeQueries
}