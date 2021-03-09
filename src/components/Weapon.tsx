import React from 'react';
import Equipment from '../interfaces/Equipment';

interface WeaponProps {
  equipment: Equipment;
}

const Weapon: React.FC<WeaponProps> = (props) => {
  const { equipment } = props;
  const { nome, dano, critico, tipo, alcance } = equipment;

  return (
    <div>{`${nome} (${dano}, ${critico}) - ${tipo} - ${alcance || ''}`}</div>
  );
};

export default Weapon;
