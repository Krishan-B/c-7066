/**
 * TypeScript Configuration Index
 *
 * This file provides utilities to manage TypeScript configurations.
 * It allows for easy importing and extending of base configurations.
 */

const fs = require("fs");
const path = require("path");

// Helper function to get the absolute path to a config file
function getConfigPath(configName) {
  return path.resolve(__dirname, `${configName}.json`);
}

// Export config paths for easy reference
module.exports = {
  basePath: getConfigPath("base"),
  appPath: getConfigPath("app"),
  nodePath: getConfigPath("node"),
  testPath: getConfigPath("test"),

  // Helper to load a config file
  loadConfig: function (configName) {
    const configPath = getConfigPath(configName);
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  },
};
