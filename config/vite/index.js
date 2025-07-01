/**
 * Vite Configuration Index
 *
 * This file provides utilities to manage Vite and Vitest configurations.
 */

const path = require("path");

// Helper function to get the absolute path to a config file
function getConfigPath(configName) {
  return path.resolve(__dirname, configName);
}

// Export config paths for easy reference
module.exports = {
  viteConfigPath: getConfigPath("vite.config.ts"),
  vitestConfigPath: getConfigPath("vitest.config.ts"),
};
