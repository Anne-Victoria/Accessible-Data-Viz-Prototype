module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:jsdoc/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['jsdoc', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        require: {
          ArrowFunctionExpression: true,
        },
      },
    ],
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns-type': 'off',
    'jsdoc/valid-types': 'off',
    'jsdoc/check-types': 'off',
    'jsdoc/no-types': 'warn',
  },
};
