module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  parser: 'babel-eslint',
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'max-len': [1, 200],
    'no-shadow': 0,
    'no-plusplus': 0,
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': [
      1,
      {
        skipUndeclared: true,
      },
    ],
  },
}
