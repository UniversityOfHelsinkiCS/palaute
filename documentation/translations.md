# Translations

We try to support fi, en and sv locales.

## Quick guide for translators

1. Fork the palaute repository
2. Clone it to your machine
3. Make sure Node and npm are installed. Docker is not required.
4. Run `npm i` to install dependencies, they are needed for the translation script.
5. Run the translation checker script with `npm run translations` (see the next section for more info)
6. Do the acual thing: add/modify/... the translations in the translation files in `public/locales/{lang}/translation.json`
7. Git add, commit and push your work and open a pull request to palaute.
8. Maintainers will merge the PR and give you money.

## Translation analysis script

Command: `npm run translations`

Outputs the keys with missing translations. Red colored language indicates that the key is missing in the corresponding translation file.

Check only some languages (for example swedish):

`npm run translations -- --lang sv`

Show line locations of translation key usage in code:

`npm run translations -- --detailed`

Show potentially unused translations:

`npm run translations -- --unused`

## Using translations in code

Translations are implemented using [i18next](https://github.com/i18next/i18next) and [react-i18next](https://github.com/i18next/react-i18next).

React example

```js
import { useTranslation } from 'react-i18next'

const ComponentWithTranslations = () => {
  const { t, i18n } = useTranslation()

  console.log(`Current language is ${i18n.language}`)

  return <div>{t('common:feedback')}</div>
}
```

NodeJS example

```js
const i18n = require('../utils/i18n')

const getHelloMessage = (user) => {
  const t = i18n.getFixedT(user.language)
  
  return t('common:hello') // Hello in user's language
}
```

### Coding style considerations

<details>
  <summary>
    See details
  </summary>

When using the `t` function, always access translation keys by providing the key as a string literal as an argument directly to the function. This drastically helps searching for translation key usage and helps the job of automatic translation checker tools.

```js
// good
const someTranslatedText = t('common:validation:error')

// good
const someJsx = <div>{t('common:validation:success')}</div>

// Still fine
const options = {
  first: t('options:first'),
  second: t('options:second'),
  third: t('options:third'),
}

// Bad! Search tools or checkers can have hard time finding these keys.
const optionKeys = {
  first: 'options:first',
  second: 'options:second',
  third: 'options:third',
}

// Bad! Should only pass a string literal to t
const moreTranslatedText = t(optionKeys['first'])

// Bad!
const yetAnother = t(level === 0 ? 'common:levelZero' : 'common:levelOther')

// Do it like this:
const better = level === 0 ? t('common:levelZero') : t('common:levelOther')
```

</details>

## Translation files

Are located at `public/locales/{{language}}/{{namespace}}.json`. Namespaces are used for different variants of translations. The default namespace is `translations`, and other namespaces can extend and override keys from the default.

## Overriding translations

Create a `{{namespace}}.json` in the folder of each language where you want to override translations, and set the config value `TRANSLATION_NAMESPACE` to `{{namespace}}`.

## Troubleshooting

The i18n debug mode should be on when not in production, and you will see debug messages in console and warnings if you are missing keys or your translations are fakd in general.

You may want to also check [src/client/util/i18n.js](/src/client/util/i18n.js).

When debugging a deployment, check the `TRANSLATION_NAMESPACE` from Admin dashboard (see [configuration](configuration.md)).

If you're getting 404s for the translations, make sure the files are in the folder specified by `loadPath` in i18n initialisation.

## Known problems

The default language is en, and i18n tries to fetch en translations before the actual language of user is fetched from backend. This has no effect on user experience but may cause some 404s.
