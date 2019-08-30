CREATE DATABASE GuestBook;

USE GuestBook;

CREATE TABLE GuestBook.Users (
    id int,
    email varchar(255),
    pass varchar(255),
    PRIMARY KEY(id)
);

CREATE TABLE GuestBook.Faces(
    id int,
    user_id int,
    image_path varchar(255),
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE GuestBook.Customers(
    id int,
    user_id int,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE GuestBook.Transactions(
    id int,
    user_id int,
    transaction_data varchar(255),
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE GuestBook.CustomerFaces(
    id int,
    face_id int,
    customer_id varchar(255),
    PRIMARY KEY(id),
    FOREIGN KEY(face_id) REFERENCES Faces(id)
);

CREATE TABLE GuestBook.CustomerData(
    id int,
    customer_id int,
    user_data text,
    PRIMARY KEY(id),
    FOREIGN KEY(customer_id) REFERENCES Customers(id)
);

CREATE TABLE GuestBook.CustomerTransactions(
    id int,
    customer_id int,
    transaction_id int,
    PRIMARY KEY(id),
    FOREIGN KEY(customer_id) REFERENCES Customers(id),
    FOREIGN KEY(transaction_id) REFERENCES Transactions(id)
);