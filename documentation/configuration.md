# Configuration

Configuration is done using [node-config](https://github.com/node-config), which reads files from the `config`-directory.
All configs extend from `default.js`, and may override its values.
`development.js`, `test.js` and `production.js` can also be used depending on `NODE_ENV`.

The different configurable values are documented in `default.js`.

## Custom config

To use a custom config file, create `config/{configName}.js` and export an object from it.

Set `NODE_CONFIG_ENV={configName}` at build time and runtime.

## Usage

### Server

The NodeJS app can simply `const config = require('config')`
and `const value = config.get('key')`. The config values can be getted and parsed in some common place such as `src/server/util/config`.

### Client

Client configuration is slightly more involved.
A global `CONFIG` object is populated at build time using the webpack DefinePlugin (see `config-overrides.js`).

By default the `CONFIG` object contains all the values in config, but if you wish to exclude some from it (as they are technically public) you should add the excluded fields to the `PRIVATE_KEYS` config.

Because eslint (and we) don't like custom global objects like `CONFIG`, the values required by client are safely parsed in `src/client/util/common` to exported constants.

As client configuration happens at build time, you need to set the env `NODE_CONFIG_ENV` in the build context. See `docker-compose.ci.yml` and `Dockerfile` for example.
CI workflows may also need to set it, see `.github/production.yml`.

## Debugging

Debugging configuration issues can be challenging especially in deployments.
A widget titled 'Configuration' at `/admin/misc` displays the values of `CONFIG` and also fetches the `NODE_CONFIG_ENV` from backend.

## Future ideas

- [ ] Config validation
- [ ] Common logic to read and safely parse values with different types
- [x] Ability to select which values are shipped in the build
