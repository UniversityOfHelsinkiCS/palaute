## How to run tests

### Cypress

Before building the testing environment you need to login into docker so you can pull the test data image.

Test environment should be built by using the `docker-compose.ci.yml`- file. This makes the testing environment correspond to production environment.

Setting up the testing environment:

`docker-compose -f docker-compose.ci.yml up -d` 

When test environment has been built the tests can be run in headless mode with: 

`npm run test:e2e` 

or having cypress open with:

`npm run test:cypress`

### Jest

In order to run jest tests you need to build the app again. Build the testing environment for jest by using:

`docker-compose -f docker-compose.jest.yml up -d`

Then you can run tests by using:

`docker exec palaute_app_test npm run test`

### Sidenotes

Tests are run in E2E-mode, which matches the production environment where necessary. This unfortunately means that if there's a need to change the source code between running tests the image has to be built again. 

The tests also change the data in the database which in turn means that some tests only succeed on the first run and not on the following. This could potentially be fixed in the future, but since the CI always pulls the image between test runs it isn't that much of an issue. If however local tests that use the database are broken or need to be changed, you have to delete the database image inbetween running the test suite.

The reason why jest tests are run with different compose-file comes from the usage of supertest and it not playing nice when you already have the port open that the app uses. When using the compose-file express doesn't start listening to the port, so supertest runs fine. 

Jest environment benefits from using nodemon, so you can write tests and run them without having to build the application image between every run.