module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/Tests/**/*.test.ts', '**/?(*.)+(test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
