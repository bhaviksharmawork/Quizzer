// Polyfill for toReversed method
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

const { getDefaultConfig } = require('expo/metro-config');

// Try to get default config with error handling
let config;
try {
  config = getDefaultConfig(__dirname);
} catch (error) {
  if (error.message.includes('toReversed')) {
    // Fallback minimal config if getDefaultConfig fails
    config = {
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
      },
      resolver: {
        assetExts: ['bin', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ttf', 'otf'],
        sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      },
    };
  } else {
    throw error;
  }
}

module.exports = config;
