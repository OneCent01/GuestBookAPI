const {
	handleQuery
} = require('./connect.js')

const queryIteration = (conn, query) => new Promise((resolve, reject) => {
	handleQuery(conn, query)
		.then(res => resolve(res))
		.catch(err => reject(err))
	
});

const iterateQuries = (conn, queries, cb, i=0) => {
	return queryIteration(conn, queries[i])
		.then(res => {
			return (
				i < queries.length-1 
					? iterateQuries(conn, queries, cb, i+1) 
					: cb(true)
			)
		})
		.catch(err => {
			console.log('Query execution error: ', err)
			return cb(false, err)
		})
}

const initGuestBookDatabase = (conn) => new Promise(async (resolve, reject) => {
	handleQuery(conn, `CREATE DATABASE GuestBook;`)
	.then(res => resolve(res))
	.catch(err => reject(err))
}) 

const initGuestBookTables = (conn) => new Promise((resolve, reject) => {
	const queries = [
		'CREATE TABLE Users (id int, email varchar(255), pass varchar(255), PRIMARY KEY(id));',
		'CREATE TABLE Faces(id int,user_id int,image_path varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
		'CREATE TABLE Customers(id int,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
		'CREATE TABLE Transactions(id int,user_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
		'CREATE TABLE CustomerFaces(id int,face_id int,customer_id varchar(255),PRIMARY KEY(id),FOREIGN KEY(face_id) REFERENCES Faces(id));',
		'CREATE TABLE CustomerData(id int,customer_id int,user_data text,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id));',
		'CREATE TABLE CustomerTransactions(id int,customer_id int,transaction_id int,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(transaction_id) REFERENCES Transactions(id));'
	]

	iterateQuries(
		conn, 
		queries, 
		(success, err) => success ? resolve() : reject(err)
	)
	
})

const getAllUsers = (conn) => handleQuery(conn, `SELECT * FROM Users`)

const addUser = (conn, opts) => handleQuery(conn, `INSERT INTO Users (id, email, pass) VALUES (${opts.index}, "${opts.email}", "${opts.pass}")`)

module.exports = { 
	initGuestBookTables, 
	initGuestBookDatabase,
	getAllUsers, 
	addUser
}