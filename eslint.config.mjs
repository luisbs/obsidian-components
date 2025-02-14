import js from '@eslint/js'
import ts from 'typescript-eslint'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default ts.config(
    js.configs.recommended, //
    ts.configs.strictTypeChecked,
    ts.configs.stylisticTypeChecked,
    prettierConfig,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/array-type': [
                'error',
                { default: 'array-simple' },
            ],
            '@typescript-eslint/no-confusing-void-expression': [
                'error',
                { ignoreArrowShorthand: true },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowBoolean: true, allowNumber: true },
            ],
        },
    },
    {
        files: ['*.config.mjs', 'scripts/**', 'tests/**'],
        extends: [ts.configs.disableTypeChecked],
    },
    { ignores: ['demo/**', 'dist/**', 'lib/**'] },
)
