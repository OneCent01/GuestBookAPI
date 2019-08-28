# GuestBookAPI
Node server for the GuestBook application

Provides an interface by which the front end can interact with the database
There are endpoints for getting, creating, updating, and deleting data in various tables

## Get:
- user
- face/faces
- transcaction/transactions
- customer/customers

## Create:
- user
- face
- transaction
- customer

## Update: 
- user
- customer

## Delete:
- user
- customer


### Getting started
1. Download the repo
2. Install dependencies using `npm install`
3. Run the server with `npm run start`


### Prerequisites
The only system requireement is having Node installed.
Node can be easily installed with homebrew on a Mac with `brew install node`


### Installing
1. Open terminal
2. Navigate to folder to clone the reop
3. Clone with repo: 
`git clone https://github.com/OneCent01/GuestBookAPI`
4. Navigate into the root of the cloned repo
5. Install dependencies found in the package.json using npm install
`npm install`


### Running it
1. Open terminal
2. Navigate to the root directory of this repo
3. Run the command to locally launch the server in your machine
`npm run start` OR `node server.js`
4. Open a browser and type in the URL bar
`localhost:3000` OR (URL endpoint at which it was deployed)