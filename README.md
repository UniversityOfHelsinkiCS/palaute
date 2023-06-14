# <img src=./public/seal.gif width=100px /> Palaute ![Release](https://github.com/UniversityOfHelsinkiCS/palaute/actions/workflows/production.yml/badge.svg) ![Release](https://github.com/UniversityOfHelsinkiCS/palaute/actions/workflows/staging.yml/badge.svg)

More commonly known as **Norppa**

Production in <https://coursefeedback.helsinki.fi>

## Found a bug or have a feature request?

Write an issue if you find mistakes, problems or something to improve in Palaute.
Feel free to create a pull request.

## Environment configuration

Create a `.env` file inside the project's root directory. In that file, copy the contents of the `.env.template` file and add correct values for the variables based on the documentation.

## How users can get started with Palaute

Clone the repo, install docker to get started!

Before starting the project for the first time run `npm i` to install needed development dependencies.

To start the project in development mode use this command. It will start everything in development mode:

```bash
$ npm run start
```

## Want to debug or dev against the production database?

Run the get_prod_db.sh from scripts

```bash
./scripts/get_prod_db.sh
```

## Stuck?

If stuck reset everything and start from a clean slate:

```bash
$ npm run reset
```

## Documentation

[Documentation main page](https://github.com/UniversityOfHelsinkiCS/palaute/tree/master/documentation)

[Testing document](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/testingdocument.md)

[Visibility document](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/visibility.md)

[Accessibility document](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/accessibility.md)

## Maintainers and Contribution <img src="https://raw.githubusercontent.com/UniversityOfHelsinkiCS/palaute/382d97e68827acfa56d1a29781e0f94e8777626b/src/client/assets/toscalogo_color.svg" width="100px" />

**[Toska](https://toska.dev/)**

University of Helsinki.

### Credits

Seal emojis & gif by https://github.com/googlefonts/noto-emoji/ licenced under SIL

[norppa_holy_smoke.png](./src/client/assets/norppa_holy_smoke.png) by [tttriple](https://github.com/tttriple)
