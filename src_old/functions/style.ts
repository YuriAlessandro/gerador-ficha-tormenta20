/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const SELECT_THEMES = {
  dark: {
    primary: '#BDBDBD',
    primary25: '#c9c9c9',
    primary50: '#d4d4d4',
    primary75: '#d4d4d4',
    danger: '#de350b',
    dangerLight: '#ffbdad',
    neutral0: '#3D3D3D',
    neutral15: '#363636',
    neutral20: '#171717',
    neutral30: '#181818',
    neutral40: '#191919',
    neutral50: '#FAFAFA',
    neutral60: '#212121',
    neutral80: '#FFF',
  },
  default: {
    primary: '#2684ff',
    primary75: '#4c9aff',
    primary50: '#b2d4ff',
    primary25: '#deebff',
    danger: '#de350b',
    dangerLight: '#ffbdad',
    neutral0: '#ffffff',
    neutral5: '#f2f2f2',
    neutral10: '#e6e6e6',
    neutral20: '#cccccc',
    neutral30: '#b3b3b3',
    neutral40: '#999999',
    neutral50: '#808080',
    neutral60: '#666666',
    neutral70: '#4d4d4d',
    neutral80: '#333333',
    neutral90: '#1a1a1a',
  },
};

const getSelectTheme = (theme: string) => {
  if (theme === 'dark') {
    return SELECT_THEMES.dark;
  }

  return SELECT_THEMES.default;
};

export default getSelectTheme;
