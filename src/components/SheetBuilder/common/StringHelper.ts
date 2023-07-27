export const addSign = (value: number) => (value > 0 ? `+${value}` : value);
export const addSignForRoll = (value: number) =>
  value >= 0 ? `+${value}` : value;
