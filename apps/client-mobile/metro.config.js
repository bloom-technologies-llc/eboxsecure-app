// metro.config.js
// Learn more: https://docs.expo.dev/guides/monorepos/
// const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativeWind } = require("nativewind/metro");

const path = require("path");

module.exports = withTurborepoManagedCache(
  withMonorepoPaths(
    withNativeWind(getDefaultConfig(__dirname), {
      input: "./app/global.css",
      configPath: "./tailwind.config.ts",
    }),
  ),
);

/**
 * Add the monorepo paths to the Metro config.
 * This allows Metro to resolve modules from the monorepo.
 *
 * @see https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withMonorepoPaths(config) {
  console.info("Running withMonorepoPaths");
  const projectRoot = __dirname;
  console.log("projectRoot", projectRoot);
  const workspaceRoot = path.resolve(projectRoot, "../..");
  console.log("workspaceRoot", workspaceRoot);
  // #1 - Watch all files in the monorepo
  config.watchFolders = [workspaceRoot];
  console.log("finished watching folders config");
  // #2 - Resolve modules within the project's `node_modules` first, then all monorepo modules
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];
  console.log("finished node modules paths config");
  return config;
}

/**
 * Move the Metro cache to the `node_modules/.cache/metro` folder.
 * This repository configured Turborepo to use this cache location as well.
 * If you have any environment variables, you can configure Turborepo to invalidate it when needed.
 *
 * @see https://turbo.build/repo/docs/reference/configuration#env
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withTurborepoManagedCache(config) {
  console.info("Running withTurborepoManagedCache");
  config.cacheStores = [
    new FileStore({ root: path.join(__dirname, "node_modules/.cache/metro") }),
  ];
  console.log("finished withTurborepoManagedCache");
  return config;
}
