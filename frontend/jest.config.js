module.exports = {

  // export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/(*.)+(spec|test).+(ts|tsx)'],
  setupFiles: ['./test-env.js'],
  transform: {
    // '^.+\\.tsx?$': 'esbuild-jest',
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // testEnvironmentOptions: {
  //   scriptPath: "dist/index.mjs",
  //   modules: true,
  // },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      useESM: true,
    },
  },
  maxWorkers: 1
}
