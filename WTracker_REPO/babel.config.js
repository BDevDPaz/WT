module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin mandatorio para habilitar las animaciones de React Native Reanimated v3
      'react-native-reanimated/plugin',
    ],
  };
};
