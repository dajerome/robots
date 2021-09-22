# full-stack-interview

## Description

Time limit: 4 hours

You are creating an application for managing your robot collection.<br/><br/>
This project is intended to provide you with an easy starting point to demonstrate your skills.<br/>
A bare [Create React App](https://github.com/facebook/create-react-app) project is provided as well as a basic [express](https://expressjs.com/) API.<br/>
The project supports hot reloading.

## Setup

### Start and initialize database:

To run the postgres database, make sure you have docker installed: https://docs.docker.com/get-docker/
Then, from within the `db` directory, run `./start-pg.sh`

### Install dependencies:

`npm install`

### Run:

`npm run start`

App: `localhost:3000`
API: `localhost:3001`
Swagger document: `localhost:3001/api`

### Sample requests:

`robots.postman_collection.json` contains sample postman requests

## Api next steps:
- Impovements can be made to the api in the following areas
  - validation of create robot input
  - api for update and delete robot
  - api for weapons (create weapons etc)
  - cleanup fight logic
  - fight logic is not correctly handling health
  - round log is not correct (due to above)
  - add round log to db
  - api for fights (get past fight results etc)

## Requirements:

- Your project must include detailed instructions on any necessary setup and it must be runnable.
- Data created by user interactions must be "persisted" in some way by the API such that the front-end app can retrieve it.
- There are no specific design or style requirements for the UI other than it must be functional.

### App

- View all robots
- View details of a single robot
- A way for a user to create a robot
- A way to delete a specific robot
- A way for robots to fight
- A way to view past battle results

### API

- Create robots, which have the following properties
  - Name
  - Color
  - Attack
  - Defense
- Get a robot
- Modify the color, attack and defense of a robot
- Delete a robot
- Store battle results

### Extra Credit

You are encouraged to have fun with the project. Feel free to add anything you like to the app.<br/>
A few ideas:<br/>

- Provide a working database solution for the project
- Style the app
- Add new capabilities to your robots (more types of attacks, super moves, healing, etc.)
- Support multiple users of the application
