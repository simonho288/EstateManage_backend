// module.exports = {

export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: 'miniflare',
  testMatch: ['**/test/**/*.+(ts|tsx|js)'],
  transform: {
    // '^.+\\.tsx?$': 'esbuild-jest',
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testEnvironmentOptions: {
    scriptPath: "dist/index.mjs",
    modules: true,
  },
  globals: {
    "ts-jest": {
      tsconfig: "test/tsconfig.json",
      useESM: true,
    },
  },
  maxWorkers: 1
}
