// Jest Security Testing Configuration
// Specialized configuration for security testing with enhanced coverage and reporting

module.exports = {
  // Base configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/security/**/*.test.{ts,js}',
    '**/tests/security/**/*.spec.{ts,js}'
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/security/setup/security-test-setup.ts'
  ],
  
  // Coverage configuration for security-critical components
  collectCoverageFrom: [
    'src/utils/auth/**/*.{ts,tsx}',
    'src/features/auth/**/*.{ts,tsx}',
    'src/hooks/market/api/**/*.{ts,tsx}',
    'src/utils/api/**/*.{ts,tsx}',
    'src/middleware/**/*.{ts,tsx}',
    'src/lib/security/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  
  // Coverage thresholds specifically for security components
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/utils/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/features/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/hooks/market/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage/security',
  
  // Test timeout for security tests (some may take longer)
  testTimeout: 30000,
  
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output for security tests
  verbose: true,
  
  // Custom reporters for security testing
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/security/html-report',
      filename: 'security-test-report.html',
      pageTitle: 'TradePro Security Test Report',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }],
    ['jest-junit', {
      outputDirectory: './coverage/security',
      outputName: 'security-junit.xml',
      suiteName: 'TradePro Security Tests'
    }]
  ],
  
  // Test result processor for security analysis
  testResultsProcessor: '<rootDir>/tests/security/processors/security-results-processor.js',
  
  // Watch plugins for development
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Environment variables for security testing
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    SECURITY_TEST_MODE: 'true'
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring
  detectOpenHandles: true,
  forceExit: true
};
