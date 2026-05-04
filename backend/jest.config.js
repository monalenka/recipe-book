module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/api/integration/setup.js'],
    testMatch: ['**/tests/api/integration/**/*.test.js'],
};