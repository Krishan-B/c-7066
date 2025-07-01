/**
 * Jest Configuration Index
 *
 * This file provides utilities to manage Jest configurations.
 * It allows for easy importing and extending of base configurations.
 */

const path = require("path");

// Helper function to get the absolute path to a config file
function getConfigPath(configName) {
  return path.resolve(__dirname, configName);
}

// Export config paths for easy reference
module.exports = {
  defaultConfig: getConfigPath("jest.config.mjs"),
  integrationConfig: getConfigPath("integration.config.json"),

  // Helper to create a config that extends another config
  extendConfig: function (configPath, overrides) {
    const baseConfig = require(configPath);
    return { ...baseConfig, ...overrides };
  },
};
