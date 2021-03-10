import React from 'react';
import '../assets/css/result.css';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const { spells, spellPath } = props;
  return (
    <div>
      {spells.length > 0 && (
        <div className='speelsInfos'>
          <span>
            <strong>Atributo-Chave:</strong> INT
          </span>
          <span>
            <strong>Modificador:</strong> MOD
          </span>
          <span>
            <strong>Teste de Resistência:</strong> 0{' '}
            <span className='spellCalc'>
              (10 + ¹/₂ nível + mod. atributo-chave)
            </span>
          </span>
        </div>
      )}
      <div>
        {spellPath?.schools && (
          <li>
            Escolas:{' '}
            {spellPath?.schools?.map((school) => (
              <span key={school}>{school}, </span>
            ))}
          </li>
        )}
      </div>
      {spells.length === 0 ? (
        <span>Não Possui</span>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Magia</th>
              <th>Escola</th>
              <th>Execução</th>
              <th>Alcance</th>
              <th>Área</th>
              <th>Duração</th>
              <th>Resistência</th>
              <th>Efeito</th>
            </tr>
          </thead>
          <tbody>
            {spells.map((spell) => (
              <tr key={spell.nome}>
                <td>{spell.nome}</td>
                <td>-</td>
                <td>{spell.execucao}</td>
                <td>{spell.alcance}</td>
                <td>{spell.area || '-'}</td>
                <td>{spell.duracao}</td>
                <td>{spell.resistencia || '-'}</td>
                <td>{spell.efeito || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Spells;
