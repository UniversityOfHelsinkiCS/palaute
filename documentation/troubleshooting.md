# Troubleshooting

We list some issues and solutions faced more than once by Norppa developers

## What to do when

### package not found

`$ npm i`

### Browser: Uncaught ReferenceError: process is not defined

delete package-lock, node_modules, docker compose down, docker compose build, docker compose up, npm i until it works

If even that fails, time to rm -r -f palaute and git clone
