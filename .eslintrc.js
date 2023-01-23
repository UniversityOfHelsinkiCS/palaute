module.exports = {
  extends: ['airbnb', 'prettier', 'plugin:cypress/recommended'],
  plugins: ['prettier', 'cypress'],
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
  },
  rules: {
    // 'prettier/prettier': ['warn'],
    'max-len': [1, 400],
    'no-shadow': 0,
    'no-plusplus': 0,
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'eslintreact/jsx-props-no-spreading': 'off',
    'no-unused-vars': 'warn',
    'arrow-body-style': 'warn',
    'no-param-reassign': 'off',
    'no-restricted-exports': 'off',
    'react/prop-types': [
      1,
      {
        skipUndeclared: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/jsx-boolean-value': 'warn',
    'react/jsx-curly-brace-presence': 'warn',
    'react/destructuring-assignment': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'spaced-comment': 'off',
  },
}
