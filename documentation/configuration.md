# Configuration

Configuration is done using [node-config](https://github.com/node-config).
All configs extend from the `default.js` config, and may override its values.
`development.js`, `test.js` and `production.js` can also be used depending on `NODE_ENV`.

The different configurable values are documented in `default.js`.

## Custom config

To use a custom config file, create `config/{configName}.js` and export an object from it.

Set `NODE_CONFIG_ENV={configName}` at build time and runtime.

## Details

### Server

The NodeJS app can simply `const config = require('config')`
and `const value = config.get('key')`. The config values can be getted and parsed in some common place such as `src/server/util/config`.

### Client

Client configuration is slightly more involved.
A global `CONFIG` object is polyfilled at build time using the webpack DefinePlugin (see `config-overrides.js`).

As client configuration happens at build time, you need to set the env `NODE_CONFIG_ENV` in the build context. See `docker-compose.ci.yml` and `Dockerfile` for example.
