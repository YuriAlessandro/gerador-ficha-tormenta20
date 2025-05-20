import React from 'react';
import '../assets/css/result.css';

interface AttributeProps {
  id: string;
  name: string;
  value: number;
  mod: number;
  isDarkMode: boolean;
}

const Attribute: React.FC<AttributeProps> = (props) => {
  const { value, mod, name, id, isDarkMode } = props;
  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  return (
    <div
      key={getKey(name)}
      className={`attributeItem ${isDarkMode ? 'dark' : ''}`}
    >
      <div>
        <strong>{name.substring(0, 3).toUpperCase()}</strong>
      </div>
      <div className='value'>
        {mod > 0 ? '+' : ''}
        {mod}
      </div>
      <div className='mod'>{value}</div>
    </div>
  );
};

export default Attribute;
