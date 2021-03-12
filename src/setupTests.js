// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

function toBeDistinct(expected) {
  const pass =
    Array.isArray(expected) && new Set(expected).size === expected.length;
  if (pass) {
    return {
      message: () => `expected [${expected}] array is unique`,
      pass: true,
    };
  }
  return {
    message: () => `expected [${expected}] array is not to unique`,
    pass: false,
  };
}

expect.extend({
  toBeDistinct,
});
