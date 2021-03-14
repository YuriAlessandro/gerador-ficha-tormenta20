declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveUniqueElements(): R;
    }
  }
}

export {};
