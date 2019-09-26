const {
	handleQuery,
	executeQueries
} = require('../connect.js')

/*TABLES*/
const initGuestBookDatabase = (conn) => handleQuery(conn, `CREATE DATABASE GuestBook;`)
const initGuestBookTables = (conn) => executeQueries(conn, [
	'CREATE TABLE Users(id int not null auto_increment unique, email varchar(255) unique, hash text, salt varchar(255), PRIMARY KEY(id));',
	'CREATE TABLE Customers(id int  not null auto_increment,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Transactions(id int not null auto_increment,user_id int,customer_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(user_id) REFERENCES Users(id));',
	'CREATE TABLE Products(id int not null auto_increment unique, barcode text, PRIMARY KEY(id));',
	'CREATE TABLE UserProducts(id int not null auto_increment unique,user_id int not null,product_id int, SKU varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Products(id));',
	'CREATE TABLE ProductImages(id int not null auto_increment unique, url text not null, product_id int not null, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES Products(id));',
	'CREATE TABLE UserProductPrices(id int not null auto_increment unique, price decimal not null, user_product_id int, PRIMARY KEY(id), FOREIGN KEY(user_product_id) REFERENCES UserProducts(id));',
	'CREATE TABLE Categories(id int not null auto_increment unique, category text, PRIMARY KEY(id));',
	'CREATE TABLE ProductCategories(id int not null auto_increment unique, category varchar(255) not null, product_id int, category_id int, PRIMARY KEY(id), FOREIGN KEY(category_id) REFERENCES Categories(id), FOREIGN KEY(product_id) REFERENCES Products(id));',
	'CREATE TABLE ProductTitles(id int not null auto_increment unique, title varchar(255) not null, product_id int, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES Products(id));',
	'CREATE TABLE ProductDescriptions(id int not null auto_increment unique, description text not null, product_id int, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES Products(id));',
	'CREATE TABLE TransactionProduct(id int not null auto_increment unique, quantity int not null, transaction_id int, product_id int, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES Products(id), FOREIGN KEY(transaction_id) REFERENCES Transactions(id));',

])

/*USERS*/
const addUser = (conn, opts) => handleQuery(conn, `INSERT INTO Users (email, salt, hash) VALUES ("${opts.email}", "${opts.salt}", "${opts.hash}");`)
const getUser = (conn, opts) => handleQuery(
	conn, 
	`SELECT * FROM Users 
	WHERE email="${opts.email}";`
)

/*TRANSACTIONS*/
const addTransaction = (conn, opts) => handleQuery(conn, `INSERT INTO Transactions (user_id, transaction_data) VALUES ("${opts.user_id}", "${opts.data}");`)
const getTransactions = (conn, opts) => handleQuery(conn, `SELECT * FROM Transactions WHERE user_id="${opts.user_id}";`)

/*CUSTOMERS*/
const addCustomer = (conn, opts) => handleQuery(conn, `INSERT INTO Customers (user_id) VALUES ("${opts.user_id}");`)
const getCustomers = (conn, opts) => handleQuery(conn, `SELECT * FROM Customers WHERE user_id="${opts.user_id}";`)

/*PRODUCTS*/
const addProduct = (conn, opts) => handleQuery(conn, `INSERT INTO Products (barcode) VALUES ("${opts.barcode}");`)
const getProducts = (conn, opts) => handleQuery(conn, `SELECT * FROM Products WHERE barcode in (${
	opts.barcodes.map(barcode => `"${barcode}"`).join(', ')
});`)

const addImages = (conn, opts) => handleQuery(
	conn, 
	`INSERT INTO ProductImages (url, product_id) values ${
		opts.images.map(
			image_url => `("${image_url}", "${opts.product_id}")`
		).join(',')
	};`
)
const getImages = (conn, opts) => handleQuery(conn, `SELECT * FROM ProductImages WHERE product_id="${opts.product_id}";`)

const addPrice = (conn, opts) => handleQuery(conn, `INSERT INTO ProductImages (price, product_id) values ("${opts.price}", "${opts.product_id}");`)
const getPrices = (conn, opts) => handleQuery(conn, `SELECT * FROM Prices WHERE product_id="${opts.product_id}";`)

/*USER PRODUCTS*/
const addUserProduct = (conn, opts) => handleQuery(conn, `INSERT INTO UserProducts (user_id, product_id, stock) VALUES ("${opts.user_id}", "${opts.product_id}", "${opts.stock}")`)
const getUserProducts = (conn, opts) => handleQuery(conn, `SELECT * FROM UserProducts WHERE user_id="${opts.user_id}";`)


module.exports = { 
	initGuestBookDatabase,
	initGuestBookTables,
	addUser,
	getUser,
	addTransaction,
	getTransactions,
	addCustomer,
	getCustomers,
	addProduct,
	getProducts,
	addImages,
	getImages,
	addPrice,
	getPrices,
	addUserProduct,
	getUserProducts
}