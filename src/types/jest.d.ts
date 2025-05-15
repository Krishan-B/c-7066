
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

declare global {
  const describe: typeof jest.describe;
  const test: typeof jest.test;
  const it: typeof jest.it;
  const expect: typeof jest.expect;
  const beforeAll: typeof jest.beforeAll;
  const afterAll: typeof jest.afterAll;
  const beforeEach: typeof jest.beforeEach;
  const afterEach: typeof jest.afterEach;
  const jest: typeof jest;
}
