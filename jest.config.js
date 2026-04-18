module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns))',
  ],
  moduleNameMapper: {
    '^expo-file-system/legacy$': '<rootDir>/__tests__/__mocks__/emptyModule.js',
    '^react-native-zip-archive$': '<rootDir>/__tests__/__mocks__/emptyModule.js',
    '^react-native$': '<rootDir>/__tests__/__mocks__/reactNative.js',
    '^expo-constants$': '<rootDir>/__tests__/__mocks__/expoConstants.js',
    '^@react-native-documents/picker$': '<rootDir>/__tests__/__mocks__/emptyModule.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
};
