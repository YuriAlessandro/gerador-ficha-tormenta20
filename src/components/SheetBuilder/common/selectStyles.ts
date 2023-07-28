/* eslint-disable @typescript-eslint/no-explicit-any */
// const ls = localStorage;

// const isDarkTheme = ls.getItem('dkmFdn') === 'true';

export const selectStyles = {
  option: (base: any, state: any) => ({
    ...base,
    color: state.isDisabled ? '#9c9c9c' : '#000000',
    backgroundColor: state.isSelected ? '#e6e6e6' : '#00000',
    '&:hover': {
      backgroundColor: '#da5b5d',
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    paddingLeft: '36px',
  }),
};
