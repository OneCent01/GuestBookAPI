const mysql = require('mysql')

const {
	initGuestBookDatabase,
	initGuestBookTables
} = require('./dbQueries.js')

const {
	initConnection,
	killConnection
} = require('./connect.js')

// attempt to establish connection toa specific database in mySQL,
// if it's not there, make it, then try connecting to it again
const initAndCreatDbIfNone = (connection, opts) => {
	initConnection(connection)
	.then(() => console.log('GuestBook DB exists, connected...'))
	.catch(err => {
		if(err && err.error.code === 'ER_BAD_DB_ERROR') {
			// the connection to databae failed because the database doesn't
			// exist.. make it, then re-establish the connection with the db
			connection = mysql.createConnection({ ...opts });
			initConnection(connection)
				.then((res) => {
					initGuestBookDatabase(connection)
					.then(res => {
						console.log('GuestBook DB created; re-establishing connection to DB...')
						killConnection(connection)
						.then((killRes) => {
							connection = mysql.createConnection({
								...opts,
								database: 'guestbook'
							})
							initConnection(connection)
							.then(() => {
								console.log('GuestBook DB created and connection re-established successfully....')
								initGuestBookTables(connection)
									.then(() => console.log('tables successfully created!'))
									.catch(err => console.log('init tables error: ', err))
							})
							.catch(err => console.log('Unable to connect to newly creted DB...: ', err))
						})
					})
					.catch(err => console.log('Unable to create db...'))
				})
				.catch(err => console.log('Can\'t establish connection to local mySQL server...'))
		} else {
			console.log('Unknown error has occurred attepting to connect to mySQL: ', err)
		}
	})
}

module.exports = {
	initAndCreatDbIfNone
}