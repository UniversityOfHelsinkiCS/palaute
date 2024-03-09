### External APIs

Render the swagger ui from the json-files, eg. to see page_swagger.json you can run

```
docker run -p 8080:8080 -e SWAGGER_JSON=/foo/swagger.json -v ./pate_swagger.json:/data/swagger.json swaggerapi/swagger-ui
```

Access the API document wit browser http://localhost:8080
