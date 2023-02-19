# Translations

Translation workflow is done using [i18next](https://github.com/i18next/i18next) and [react-i18next](https://github.com/i18next/react-i18next).

We try to support fi, en and sv locales, but fi and en are prioritized.

## In code

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

// TODO. i18n setup for backend is a work in progress.

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
