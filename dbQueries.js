const {
	handleQuery,
	executeQueries
} = require('./connect.js')

const mysql = require('mysql')

/*TABLES*/
const initGuestBookDatabase = (conn) => handleQuery(conn, `CREATE DATABASE GuestBook;`)
const initGuestBookTables = (conn) => executeQueries(conn, [
	'CREATE TABLE Users(id int not null auto_increment unique, email varchar(255) unique, hash text, salt varchar(255), PRIMARY KEY(id));',
	'CREATE TABLE Faces(id int not null auto_increment,user_id int,image_path varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Customers(id int  not null auto_increment,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Transactions(id int not null auto_increment,user_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE CustomerFaces(id int not null auto_increment,face_id int,customer_id varchar(255),PRIMARY KEY(id),FOREIGN KEY(face_id) REFERENCES Faces(id));',
	'CREATE TABLE CustomerData(id int not null auto_increment,customer_id int,user_data text,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id));',
	'CREATE TABLE CustomerTransactions(id int not null auto_increment,customer_id int,transaction_id int,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(transaction_id) REFERENCES Transactions(id));',
	'CREATE TABLE Products(id int not null auto_increment,name varchar(255),category varchar(255),barcode varchar(255), description varchar(255),img_urls varchar(255),price_data varchar(255),PRIMARY KEY(id));',
	'CREATE TABLE UserProducts(id int not null auto_increment,user_id int not null,product_id int not null, SKU varchar(255),stock int,price decimal,history varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Products(id));'
])

/*USERS*/
const getAllUsers = (conn) => handleQuery(conn, `SELECT * FROM Users`)
const addUser = (conn, opts) => handleQuery(conn, `INSERT INTO Users (email, salt, hash) VALUES ("${opts.email}", "${opts.salt}", "${opts.hash}")`)
const getUser = (conn, opts) => handleQuery(conn, `SELECT * FROM Users WHERE ${opts.email ? 'email' : 'id'}="${opts.email ? opts.email : opts.id}"`)
const updateUser = (conn, opts) => handleQuery(conn, `UPDATE Users SET email="${opts.email}",  pass="${opts.pass}" WHERE id="${opts.id}";`)
const deleteUser = (conn, opts) => handleQuery(conn, `DELETE FROM Users WHERE id="${opts.id}"`)

/*FACES*/
const addFace = (conn, opts) => handleQuery(conn, `INSERT INTO Faces (user_id, image_path) VALUES ("${opts.user_id}", "${opts.image_path}")`)
const getFaces = (conn, opts) => handleQuery(conn, `SELECT * FROM Faces WHERE user_id="${opts.user_id}"`)

/*TRANSACTIONS*/
const addTransaction = (conn, opts) => handleQuery(conn, `INSERT INTO Transactions (user_id, transaction_data) VALUES ("${opts.user_id}", "${opts.data}")`)
const getTransactions = (conn, opts) => handleQuery(conn, `SELECT * FROM Transactions WHERE user_id="${opts.user_id}"`)
const deleteTransaction = (conn, opts) => handleQuery(conn, `DELETE FROM Transactions WHERE id="${opts.id}"`)

/*CUSTOMERS*/
const addCustomer = (conn, opts) => handleQuery(conn, `INSERT INTO Customers (user_id) VALUES ("${opts.user_id}")`)
const getCustomers = (conn, opts) => handleQuery(conn, `SELECT * FROM Customers WHERE user_id="${opts.user_id}"`)
// const updateCustomer = (conn, opts) => handleQuery(conn, `UPDATE Customers SET (SET_GOES_HERE) WHERE id="${opts.id}";`)
const deleteCustomer = (conn, opts) => handleQuery(conn, `DELETE FROM Customers WHERE id="${opts.id}"`)

/*PRODUCTS*/
const addProduct = (conn, opts) => handleQuery(conn, `INSERT INTO Products (category, barcode, description, img_urls, price_data) VALUES ("${opts.category}", "${opts.barcode}", "${opts.description}", "${opts.img_urls}", "${opts.price_data}");`)
const getProducts = (conn, opts) => handleQuery(conn, `SELECT * FROM Products WHERE id in (${
	opts.product_ids.reduce((final, id, i) => i ? `${final}, "${id}"` : `"${id}"`, '')
})`)
const updateProduct = (conn, opts) => handleQuery(conn, `UPDATE Products SET ${
	opts.attrs.reduce((final, attr, i) => i ? `${final}, ${attr.key}="${attr.value}"` : `${attr.key}="${attr.value}"`, '')
} WHERE id="${opts.product_id}"`)
const deleteProduct = (conn, opts) => handleQuery(conn, `DELETE FROM Products WHERE id="${opts.product_id}"`)

/*USER PRODUCTS*/
const addUserProduct = (conn, opts) => handleQuery(conn, `INSERT INTO UserProducts (user_id, product_id, stock, price, history) VALUES ("${opts.user_id}", "${opts.product_id}", "${opts.stock}", "${opts.price}" , "${opts.history}")`)
const getUserProducts = (conn, opts) => handleQuery(conn, `SELECT * FROM UserProducts WHERE user_id="${opts.user_id}";`)
const updateUserProduct = (conn, opts) => handleQuery(conn, `UPDATE UserProducts SET ${
	opts.attrs.reduce((final, attr, i) => i ? `${final}, ${attr.key}="${attr.value}"` : `${attr.key}="${attr.value}"`, '')
} WHERE id="${opts.user_product_id}"`)
const deleteUserProduct = (conn, opts) => handleQuery(conn, `DELETE FROM UserProducts WHERE id="${opts.user_product_id}"`)

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
	deleteTransaction,
	addCustomer,
	getCustomers,
	deleteCustomer,
	addProduct,
	getProducts,
	updateProduct,
	deleteProduct,
	addUserProduct,
	getUserProducts,
	updateUserProduct,
	deleteUserProduct
}