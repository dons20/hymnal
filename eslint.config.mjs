// @ts-check
import js from "@eslint/js";
import react from "eslint-plugin-react";
import prettierConfig from "eslint-plugin-prettier/recommended";
// @ts-expect-error No type definitions available
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import testingLibrary from "eslint-plugin-testing-library";
import * as tsParser from "@typescript-eslint/parser";
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.recommended,
    prettierConfig,
    { ignores: ["**/serviceWorker.js"] },
    {
        files: ["**/*.js"],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
        plugins: {
            react,
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: "./tsconfig.json",
                globals: {
                    ...globals.browser,
                },
            },
        },

        settings: {
            "import/resolver": {
                node: {
                    paths: ["src"],
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
                    moduleDirectory: ["../node_modules", "./src"],
                },
            },
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },
            react: {
                version: "18.2",
            },
        },

        rules: {
            "react/react-in-jsx-scope": "off",
            "react/jsx-filename-extension": [
                1,
                {
                    extensions: [".tsx", ".jsx"],
                },
            ],
            "import/extensions": "off",
            "import/no-extraneous-dependencies": "off",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-no-bind": "off",
            "react/prop-types": "off",
            "react/function-component-definition": "off",
        },
    },
    {
        files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
        ...testingLibrary.configs["flat/react"],
        plugins: {
            ...testingLibrary.configs["flat/react"].plugins,
            jest: jestPlugin,
        },
        languageOptions: {
            parserOptions: {
                globals: {
                    ...globals.jest,
                },
            },
        },
    }
);
