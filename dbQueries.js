const {
	handleQuery,
	executeQueries
} = require('./connect.js')


const initGuestBookDatabase = (conn) => handleQuery(conn, `CREATE DATABASE GuestBook;`)

const initGuestBookTables = (conn) => executeQueries(conn, [
	'CREATE TABLE Users (id int not null auto_increment, email varchar(255), pass varchar(255), PRIMARY KEY(id));',
	'CREATE TABLE Faces(id int  not null auto_increment,user_id int,image_path varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Customers(id int  not null auto_increment,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Transactions(id int not null auto_increment,user_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE CustomerFaces(id int not null auto_increment,face_id int,customer_id varchar(255),PRIMARY KEY(id),FOREIGN KEY(face_id) REFERENCES Faces(id));',
	'CREATE TABLE CustomerData(id int not null auto_increment,customer_id int,user_data text,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id));',
	'CREATE TABLE CustomerTransactions(id int not null auto_increment,customer_id int,transaction_id int,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(transaction_id) REFERENCES Transactions(id));'
])

const getAllUsers = (conn) => handleQuery(conn, `SELECT * FROM Users`)
const addUser = (conn, opts) => handleQuery(conn, `INSERT INTO Users (email, pass) VALUES ("${opts.email}", "${opts.pass}")`)
const getUser = (conn, opts) => handleQuery(conn, `SELECT * FROM Users WHERE id="${opts.index}"`)
const updateUser = (conn, opts) => handleQuery(conn, `UPDATE Users SET email="${opts.email}",  pass="${opts.pass}" WHERE id="${opts.index}"`)


module.exports = { 
	initGuestBookTables, 
	initGuestBookDatabase,
	getAllUsers, 
	addUser,
	getUser,
	updateUser
}