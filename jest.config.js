
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/types/'
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: 'tsconfig.json',
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
