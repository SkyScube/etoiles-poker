import type {Config} from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['react-server', 'react-native', 'browser', 'default'],
  },
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    // Mock CSS and asset imports
    '^.+\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['<rootDir>/test/**/?(*.)+(spec|test).(ts|tsx)'],
  transformIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/_app.tsx',
    '!src/**/_document.tsx',
    '!src/**/types.ts',
  ],
  coverageDirectory: 'coverage',
};

export default config;
