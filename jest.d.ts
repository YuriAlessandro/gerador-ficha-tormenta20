declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDistinct(): R;
    }
  }
}

export {};
