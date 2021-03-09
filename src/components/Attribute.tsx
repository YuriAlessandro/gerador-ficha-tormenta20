import React from 'react';
import '../assets/css/result.css';

interface AttributeProps {
  id: string;
  name: string;
  value: number;
  mod: number;
}

const Attribute: React.FC<AttributeProps> = (props) => {
  const { value, mod, name, id } = props;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  return (
    <div key={getKey(name)} className='attributeItem'>
      <div>
        <strong>{name.substring(0, 3).toUpperCase()}</strong>
      </div>
      <div className='value'>{value}</div>
      <div className='mod'>
        {mod > 0 ? '+' : ''}
        {mod}
      </div>
    </div>
  );
};

export default Attribute;
