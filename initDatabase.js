const mysql = require('mysql')

const {
	initGuestBookDatabase,
	initGuestBookTables
} = require('./database/dbQueries.js')

const {
	initConnection,
	killConnection
} = require('./connect.js')

// attempt to establish connection to a specific database in mySQL,
// if it's not there, make it, then try connecting to it again
const initAndCreatDbIfNone = (connection, opts, db) => new Promise((resolve, reject) => {
	initConnection(connection)
	.then(() => {
		console.log('GuestBook DB exists, connected...')
		resolve(connection)
	})
	.catch(err => {
		if(err && err.error.code === 'ER_BAD_DB_ERROR') {
			// the connection to databae failed because the database doesn't
			// exist.. make it, then re-establish the connection with the db
			connection = mysql.createConnection({ ...opts });
			initConnection(connection)
				.then(() => {
					initGuestBookDatabase(connection)
					.then(() => {
						console.log('GuestBook DB created; re-establishing connection to DB...')
						killConnection(connection)
						.then(() => {
							connection = mysql.createConnection({
								...opts,
								database: db
							})
							initConnection(connection)
							.then(() => {
								console.log('GuestBook DB created, connection re-established....')
								initGuestBookTables(connection)
								.then(() => {
									console.log('tables successfully created...')
									resolve(connection)
									
								})
								.catch(err => {
									console.log('init tables error: ', err)
									reject(err)
								})
							})
							.catch(err => {
								console.log('Unable to connect to newly creted DB...')
								reject(err)
							})
						})
					})
					.catch(err => {
						console.log('Unable to create db...')
						reject(err)
					})
				})
				.catch(err => {
					console.log('Can\'t establish connection to local mySQL server...')
					reject(err)
				})
		} else {
			console.log('Unknown error has occurred attepting to connect to mySQL')
			reject(err)
		}
	})
})

module.exports = {
	initAndCreatDbIfNone
}