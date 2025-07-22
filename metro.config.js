const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable react-native-screens by blacklisting it
config.resolver.blockList = [
  /node_modules\/react-native-screens/
];

module.exports = config;
