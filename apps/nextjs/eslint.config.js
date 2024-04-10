import baseConfig from "@ebox/eslint-config/base";
import nextjsConfig from "@ebox/eslint-config/nextjs";
import reactConfig from "@ebox/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
