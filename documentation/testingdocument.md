# Testing

Norppa has end-to-end tests written in Cypress to test the server and frontend together in a setup similar to the production environment.

The tests are run against an empty database that is cleared and seeded at the beginning of each test.

### How to run the tests

`npm run test` to run the tests against a production build. This is used in actions CI. Warn, building the frontend takes approx. 60 seconds.

`npm run test:cypress` to open the Cypress UI, ready to start testing the app.

`npm run test:run` to run all the Cypress specs in headless mode

### How to write and run tests locally

The `npm run test` command builds the testing environment each time from scratch and takes significant amount of time because of that. The base image in [Dockerfile](/Dockerfile) must be changed to node for this to work locally as the openshift image is not available.

For writing tests locally there is a docker compose file for the purpose that allows you to make changes to the build while developing. Essentially meaning that the tests are run in dev envinroment rather than builded application.

`npm run test:setuplocal` to spin up quickly the app in dev mode with an empty database. CHANGE the baseUrl port from 8000 to 3000 in [cypress config](/cypress.config.js) 

When all of the services are running in the docker compose, Cypress can be started either in the headless mode with `npm run test:run` or opened with `npm run test:cypress`.

While writing the tests it is paramount to clean up the database between tests.

### How seeding works

The database is seeded by Cypress requests to a testing endpoint in the backend. Its code is at `src/server/test`. The code to seed the database for different situations is also there.

The testing endpoint is only enabled when NODE_ENV=development or NODE_ENV=test and E2E=true. It has no authentication nor any of the other common middleware shared by actual app endpoints.

The Cypress tests also make direct requests to other endpoints of the app to set up some tests (eg a put request to /api/feedback-targets/:id to set feedback open for some test).
The requests headers are set to be those of an admin-user (uid's defined by DEV_ADMINS in config.)
