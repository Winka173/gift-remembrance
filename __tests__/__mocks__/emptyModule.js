// Test-only stub for native/Expo modules that are not exercised by these unit tests.
module.exports = new Proxy(
  {},
  {
    get: () => () => undefined,
  },
);
