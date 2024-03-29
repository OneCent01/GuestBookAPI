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


### Deploy to Heroku
1. Open the terminal
2. Install the Heroku CLI
  - On a Mac this is easily accomplished via Homebrew with: 
  `brew tap heroku/brew && brew install heroku`
3. Navigate to the root of this repo in your local system
4. Login to heroku
`heroku login`
5. Create the endpoint to which this code will be uploaded
`heroku create`
6. Push the code to the newly created endpoint: 
`git push heroku master`
7. In a browser, open the application at the assigned endpoint (you'll see it in the terminal after the previous command)

A deployed heroku instance of this app can be found here: 
https://limitless-bayou-46474.herokuapp.com/

## Function documentation comment template: 
/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @param {let: type}   Description.
 * @param {[let: type]}   Description of optional variable.
 * @param {[let: type]=defaultValue}   Description of optional variable with default variable.
 * @param {let.key: type}   Description of a key in the objectVar parameter.
 *
 * @return {type} Return value description.
 */