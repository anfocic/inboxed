/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    setupFiles: ['<rootDir>/src/tests/setup.ts'],
};