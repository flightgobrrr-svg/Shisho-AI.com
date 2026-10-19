// The app reuses the website's verified legal data (../lib/*.ts) instead of
// keeping a second copy that could drift. Metro only bundles files under its
// watch folders, so the repository root is added, while module resolution for
// packages stays inside mobile/node_modules.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), path.join(repoRoot, "lib")];
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

module.exports = config;
