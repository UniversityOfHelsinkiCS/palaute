## How to run tests

### Cypress

Before building the testing environment you need to login into docker so you can pull the test data image.

Test environment should be built by using the `docker-compose.ci.yml`- file. This makes the testing environment correspond to production environment.

Setup and run tests:

`npm run test`

Setting up the testing environment:

`npm run test:setup`

When test environment has been built the tests can be run in headless mode with:

`npm run test:e2e`

or having cypress open with:

`npm run test:cypress`

### Sidenotes

Tests are run in E2E-mode, which matches the production environment where necessary. This unfortunately means that if there's a need to change the source code between running tests the image has to be built again by running:

`npm run test:setup`

The tests also change the data in the database which might sometimes break tests. Since the CI always pulls the image between test runs it isn't that much of an issue. If however local tests that use the database are broken or need to be changed, you have to delete the database image inbetween running the test suite.
