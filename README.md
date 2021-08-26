# Palaute

Production in <https://coursefeedback.helsinki.fi>

Staging in <https://study.cs.helsinki.fi/norppastaging>

## Issues with Palaute

Send an issue if you find mistakes, problems or something to improve in Palaute.
Feel free to create a pull request.

## Environment configuration

Create a `.env` file inside the project's root directory. In that file, copy the contents of the `.env.template` file and add correct values for the variables based on the documentation.

## Module missing?

Install the dependencies **inside** the container to have the application **inside** the container access them. You can use `npm run bash` to get inside the container to do so.

## How users can get started with Palaute

Clone the repo, install docker to get started!

To start the project in development mode use this command. It will start everything in development mode:

```bash
$ npm run start
```

## Want to debug or dev against the production database?

Run the get_prod_db.sh from scripts

```bash
./scripts/get_prod_db.sh
```

## Stuck? ##

If stuck reset everything and start from a clean slate:

```bash
$ npm run reset
```

## Documentation

[Database schema](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/database_schema.png)

[Testing document](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/testingdocument.md)

## Maintainers and Contribution

Toska of course.

University of Helsinki.
