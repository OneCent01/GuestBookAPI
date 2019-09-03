const {
	handleQuery,
	executeQueries
} = require('./connect.js')

const mysql = require('mysql')


const initGuestBookDatabase = (conn) => handleQuery(conn, `CREATE DATABASE GuestBook;`)

const initGuestBookTables = (conn) => executeQueries(conn, [
	'CREATE TABLE Users (id int not null auto_increment unique, email varchar(255) unique, pass varchar(255), PRIMARY KEY(id));',
	'CREATE TABLE Faces(id int not null auto_increment,user_id int,image_path varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Customers(id int  not null auto_increment,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Transactions(id int not null auto_increment,user_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE CustomerFaces(id int not null auto_increment,face_id int,customer_id varchar(255),PRIMARY KEY(id),FOREIGN KEY(face_id) REFERENCES Faces(id));',
	'CREATE TABLE CustomerData(id int not null auto_increment,customer_id int,user_data text,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id));',
	'CREATE TABLE CustomerTransactions(id int not null auto_increment,customer_id int,transaction_id int,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(transaction_id) REFERENCES Transactions(id));'
])

/*USERS*/
const getAllUsers = (conn) => handleQuery(conn, `SELECT * FROM Users`)
const addUser = (conn, opts) => handleQuery(conn, `INSERT INTO Users (email, pass) VALUES ("${opts.email}", "${opts.pass}")`)
const getUser = (conn, opts) => handleQuery(conn, `SELECT * FROM Users WHERE ${opts.email ? 'email' : 'id'}="${opts.email ? opts.email : opts.id}"`)
const updateUser = (conn, opts) => handleQuery(conn, `UPDATE Users SET email="${opts.email}",  pass="${opts.pass}" WHERE id="${opts.id}";`)
const deleteUser = (conn, opts) => handleQuery(conn, `DELETE FROM Users WHERE id="${opts.id}"`)

/*FACES*/
const addFace = (conn, opts) => handleQuery(conn, `INSERT INTO Faces (user_id, image_path) VALUES ("${opts.user_id}", "${opts.image_path}")`)
const getFaces = (conn, opts) => handleQuery(conn, `SELECT * FROM Faces WHERE user_id="${opts.user_id}"`)

/*TRANSACTIONS*/
const addTransaction = (conn, opts) => handleQuery(conn, `INSERT INTO Transactions (user_id, transaction_data) VALUES ("${opts.user_id}", "${opts.data}")`)
const getTransactions = (conn, opts) => handleQuery(conn, `SELECT * FROM Faces WHERE user_id="${opts.user_id}"`)

/*CUSTOMERS*/
const addCustomer = (conn, opts) => handleQuery(conn, `INSERT INTO Customers (user_id) VALUES ("${opts.user_id}")`)
const getCustomers = (conn, opts) => handleQuery(conn, `SELECT * FROM Customers WHERE user_id="${opts.user_id}"`)
// const updateCustomer = (conn, opts) => handleQuery(conn, `UPDATE Customers SET (SET_GOES_HERE) WHERE id="${opts.id}";`)
const deleteCustomer = (conn, opts) => handleQuery(conn, `DELETE FROM Customers WHERE id="${opts.id}"`)

module.exports = { 
	initGuestBookTables, 
	initGuestBookDatabase,
	getAllUsers, 
	addUser,
	getUser,
	updateUser,
	deleteUser,
	addFace,
	getFaces,
	addTransaction,
	getTransactions,
	addCustomer,
	getCustomers,
	deleteCustomer
}