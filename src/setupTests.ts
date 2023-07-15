// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { expect } from 'vitest';

function toHaveUniqueElements<T>(expected: T[]) {
  const pass =
    Array.isArray(expected) && new Set(expected).size === expected.length;
  if (pass) {
    return {
      message: () => `expected [${expected}] elements are unique`,
      pass: true,
    };
  }
  return {
    message: () => `expected [${expected}] array elements are not to unique`,
    pass: false,
  };
}

expect.extend({
  toHaveUniqueElements,
});
