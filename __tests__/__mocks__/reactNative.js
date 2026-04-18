// Minimal react-native stub for node-env unit tests.
module.exports = {
  Platform: {
    OS: 'ios',
    select: (spec) => spec.ios ?? spec.default,
  },
};
