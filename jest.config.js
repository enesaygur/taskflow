module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  setupFiles: ["<rootDir>/src/test/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setupAfterEnv.ts"],
  testTimeout: 15000,
};