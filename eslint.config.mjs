import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores(["**/dist/**/*", "**/node_modules/**/*", "**/coverage/**/*", "**/*.js"]),
    {
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:import/recommended",
            "plugin:import/typescript",
            "prettier",
        )),

        plugins: {
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
            import: fixupPluginRules(_import),
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["./packages/*/tsconfig.json"],
            },
        },

        settings: {
            "import/resolver": {
                typescript: {
                    project: ["./packages/*/tsconfig.json"],
                    alwaysTryTypes: true,
                },

                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            },
        },

        rules: {
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
            }],

            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],

            "import/order": ["error", {
                groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                "newlines-between": "always",

                alphabetize: {
                    order: "asc",
                },
            }],

            "@typescript-eslint/member-ordering": ["error", {
                default: [
                    "public-static-field",
                    "public-static-method",
                    "protected-static-field",
                    "protected-static-method",
                    "private-static-field",
                    "private-static-method",
                    "field",
                    "constructor",
                    "method",
                ],
            }],
        },
    },
]);