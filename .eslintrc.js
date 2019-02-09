module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/prettier'
    ],
    rules: {
        'no-console': 0,
        'no-unused-vars': [1, { argsIgnorePattern: '^_' }]
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    globals: {
        config: true,
        moment: true,
        componentHandler: true,
        MaterialTextfield: true
    }
};
