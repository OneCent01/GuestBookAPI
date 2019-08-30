const {
	handleQuery,
	initConnection, 
	killConnection
} = require('./connect.js')


const getAllUsers = () => handleQuery(`SELECT * FROM Users`)

const addUser = (index, email, pass) => handleQuery(`INSERT INTO Users (id, email, pass) VALUES (${index}, "${email}", "${pass}")`)

const initGuestBookDatabase = async () => {
	await handleQuery(`CREATE DATABASE GuestBook;`)
	await killConnection()
	await initConnection()
}

const initGuestBookTables = async () => {
	// await handleQuery(`CREATE DATABASE GuestBook;`)
	// await handleQuery('USE GuestBook;')
	await handleQuery('CREATE TABLE Users (id int, email varchar(255), pass varchar(255), PRIMARY KEY(id)')
	await handleQuery('CREATE TABLE Faces(id int,user_id int,image_path varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));')
	await handleQuery('CREATE TABLE Customers(id int,user_id int,PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));')
	await handleQuery('CREATE TABLE Transactions(id int,user_id int,transaction_data varchar(255),PRIMARY KEY(id),FOREIGN KEY(user_id) REFERENCES Users(id));')
	await handleQuery('CREATE TABLE CustomerFaces(id int,face_id int,customer_id varchar(255),PRIMARY KEY(id),FOREIGN KEY(face_id) REFERENCES Faces(id));')
	await handleQuery('CREATE TABLE CustomerData(id int,customer_id int,user_data text,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id));')
	await handleQuery('CREATE TABLE CustomerTransactions(id int,customer_id int,transaction_id int,PRIMARY KEY(id),FOREIGN KEY(customer_id) REFERENCES Customers(id),FOREIGN KEY(transaction_id) REFERENCES Transactions(id));')

}

module.exports = { getAllUsers, addUser, initGuestBookTables }