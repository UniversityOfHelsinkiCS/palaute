# Toskaboiler

Toskaboiler is a boilerplate for anyone wanting to get a kickstart on mono-repo react - fullstack project. It contains all the parts that are common in toska projects.

## Short tutorial

The project is split into 2 parts: client and server while index.js in root works as the main file. The project contains no database dependant parts.

### ApiConnection

ApiConnection is a custom redux middleware that is used in most toska software. It is used to simplify redux usage by wrapping axios.

You can see redux example using apiConnection in client/components/MessageComponent. 

### node_modules

The node_modules folder is inside the container. Some dependencies are installed based on the machine running "npm install" so a mismatch may happen if you do so.

## How users can get started with Toskaboiler

Clone the repo, install docker to get started!

`npm run start`
To start the project in development mode use this command. It will start everything in development mode.

`npm run (un)install <package-name>`
To (un)install package, this will run the command in docker container.

`npm run reset`
To reset everything. This will remove volumes and rebuild the docker images.

Please note that npm test doesn't do anything, this is intentional: testing framework is all up to you.

### Github actions
There's a bare bones github actions setup at .github/workflows. It pushes a docker image to   
`toska/{{ github.event.repository.name }}`.  

Docker username and password have to be stored as [Github secrets](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).


## Issues with Toskaboiler

Send an issue if you find mistakes, problems or something to improve in Toskaboiler.
Feel free to create a pull request.

## Maintainers and Contribution

Toska of course.

University of Helsinki.
