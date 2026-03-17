const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
// const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Required for better-auth package exports resolution
config.resolver.unstable_enablePackageExports = true;
// support t3 env
// config.resolver.unstable_conditionNames = ['browser', ...config.resolver.unstable_conditionNames]

// Force all @react-navigation/native imports to resolve to the single root copy.
// Without this, expo-router's nested copy creates a separate React context instance,
// causing "Couldn't find a LinkingContext context" on web.
const reactNavNativePath = path.resolve(
  __dirname,
  "node_modules/@react-navigation/native",
);
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@react-navigation/native": reactNavNativePath,
};

// module.exports = withNativewind(config);
module.exports = config;
