const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure custom port for BMA-2026 project
config.server = {
  ...config.server,
  port: 2026,
};

module.exports = config;
