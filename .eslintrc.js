module.exports = {
  extends: ['airbnb', 'prettier', 'plugin:cypress/recommended'],
  plugins: ['prettier', 'cypress'],
  parser: 'babel-eslint',
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': 'warn',
    'max-len': [1, 200],
    'no-shadow': 0,
    'no-plusplus': 0,
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'eslintreact/jsx-props-no-spreading': 'off',
    'no-unused-vars': 'warn',
    'no-param-reassign': 'off',
    'react/prop-types': [
      1,
      {
        skipUndeclared: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
  },
}
