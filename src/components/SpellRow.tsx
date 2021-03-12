import React from 'react';
import { Spell } from '../interfaces/Spells';

interface SpellProps {
  spell: Spell;
}

const SpellRow: React.FC<SpellProps> = (props) => {
  const { spell } = props;

  return (
    <tbody>
      <tr key={spell.nome}>
        <td>
          ({spell.manaExpense || 1}) {spell.nome}{' '}
          {spell.customKeyAttr && `(${spell.customKeyAttr})`}{' '}
        </td>
        <td>-</td>
        <td>{spell.execucao}</td>
        <td>{spell.alcance}</td>
        <td>{spell.alvo || spell.area || '-'}</td>
        <td>{spell.duracao}</td>
        <td>{spell.resistencia || '-'}</td>
      </tr>
      {spell.manaReduction && (
        <tr style={{ lineHeight: '30px' }}>
          <td colSpan={6}>
            - Você tem {spell.manaReduction} de redução de mana para a pagia{' '}
            {spell.nome}
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default SpellRow;
