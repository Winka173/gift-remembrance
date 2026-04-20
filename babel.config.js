module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['babel-preset-expo'],
    plugins: isTest
      ? []
      : [
          // react-native-worklets/plugin MUST be last (Reanimated v4+)
          'react-native-worklets/plugin',
        ],
  };
};
