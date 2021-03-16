import React from 'react';
import '../assets/css/result.css';

interface CharacterStatsProps {
  name: string;
  value: number;
  isMovement?: boolean;
  isDarkMode: boolean;
}

const CharacterStats: React.FC<CharacterStatsProps> = (props) => {
  const { value, name, isMovement, isDarkMode } = props;

  return (
    <span className={`characterStat ${isDarkMode ? 'dark' : ''}`}>
      <div className={`name ${isMovement ? 'movement' : ''}`}>
        {name.toUpperCase()}
      </div>
      <div className={`value ${isMovement ? 'movement' : ''}`}>{`${value}${
        isMovement ? 'm' : ''
      }`}</div>
    </span>
  );
};

export default CharacterStats;
