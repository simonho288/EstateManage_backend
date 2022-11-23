// module.exports = {
export default {
  testEnvironment: 'miniflare',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
}
