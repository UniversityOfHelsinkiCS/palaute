### External APIs

Render the [Swagger UI](https://swagger.io/tools/swagger-ui/) from the json-files, eg. to see `pate_swagger.json` you can run

```
docker run -p 8080:8080 -e SWAGGER_JSON=/foo/swagger.json -v ./pate_swagger.json:/data/swagger.json swaggerapi/swagger-ui
```

Access the API document with the browser http://localhost:8080
