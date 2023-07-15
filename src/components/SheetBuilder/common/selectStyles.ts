export const selectStyles = {
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? '#FFFFFF' : '#000000',
  }),
  valueContainer: (base: any) => ({
    ...base,
    paddingLeft: '36px',
  }),
};
