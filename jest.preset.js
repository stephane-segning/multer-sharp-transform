const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  setupFiles: [
    "dotenv/config"
  ],
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*spec.ts"
  ],
};
