import React from 'react';
import '../assets/css/result.css';

interface DividerProp {
  direction: string;
  isDarkMode: boolean;
}

const Divider: React.FC<DividerProp> = (props) => {
  const { direction, isDarkMode } = props;
  return (
    <div
      className={`divider div-transparent div-arrow-${direction} ${
        isDarkMode ? 'dark' : ''
      }`}
    />
  );
};

export default Divider;
