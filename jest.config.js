const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/', '/.next/', '/.next-.*/'],
}

module.exports = createJestConfig(customJestConfig)
