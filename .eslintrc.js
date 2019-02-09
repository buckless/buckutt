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
        'no-console': 0
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
