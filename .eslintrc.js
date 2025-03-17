module.exports = {
  extends: [
    'airbnb',
    'prettier',
    'plugin:cypress/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['import', 'react', 'react-hooks', 'jsx-a11y', 'prettier', 'cypress', 'eslint-plugin-react-compiler'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
  },
  rules: {
    semi: 'off',
    indent: 'off',
    'max-len': [1, 400],
    'no-shadow': 0,
    'no-plusplus': 0,
    'no-alert': 'off',
    'no-unused-vars': 'warn',
    'arrow-body-style': 'warn',
    'no-param-reassign': 'off',
    'no-restricted-exports': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'spaced-comment': 'off',
    'import/no-unused-modules': [1, { unusedExports: true, missingExports: false }],
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unused-modules': 'off',
    'react/display-name': 'off',
    'react/prop-types': [
      1,
      {
        skipUndeclared: true,
      },
    ],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/no-array-index-key': 'off',
    'react/destructuring-assignment': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-boolean-value': 'warn',
    'react/jsx-curly-brace-presence': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'react-compiler/react-compiler': 'error',
  },
  overrides: [
    {
      files: ['./**/*.ts', './**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./src/client/tsconfig.json', './src/server/tsconfig.json'],
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'airbnb-typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        semi: 'off',
        quotes: ['error', 'single'],
        'linebreak-style': ['error', 'unix'],
        'no-use-before-define': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
      },
    },
  ],
}
