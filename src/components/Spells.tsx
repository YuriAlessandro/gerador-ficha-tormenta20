import React from 'react';
import '../assets/css/result.css';
import { CharacterAttribute } from '../interfaces/Character';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';
import SpellRow from './SpellRow';

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
  keyAttr: CharacterAttribute | null;
  nivel: number;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const { spells, spellPath, keyAttr, nivel } = props;

  const mod = keyAttr ? keyAttr.mod : 0;
  const resistence = 10 + Math.floor(nivel * 0.5) + mod;

  return (
    <div>
      {spells.length > 0 && spellPath && (
        <div className='speelsInfos'>
          <span>
            <strong>Atributo-Chave:</strong> {keyAttr?.name}
          </span>
          <span>
            <strong>Modificador:</strong>{' '}
            {`${mod > 0 ? '+' : ''}${keyAttr?.mod}`}
          </span>
          <span>
            <strong>Teste de Resistência:</strong> {resistence}
            <span className='spellCalc'>
              {` (10 + ¹/₂ nível + mod. atributo-chave)`}
            </span>
          </span>
        </div>
      )}
      {spells.length === 0 ? (
        <span>Não Possui</span>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Magia</th>
                <th>Escola</th>
                <th>Execução</th>
                <th>Alcance</th>
                <th>Alvo/Área</th>
                <th>Duração</th>
                <th>Resistência</th>
              </tr>
            </thead>
            {spells.map((spell) => (
              <SpellRow spell={spell} />
            ))}
          </table>

          <div>
            {spellPath?.schools && (
              <div style={{ marginTop: '15px' }}>
                <strong>{'Escolas: '}</strong>
                {spellPath?.schools?.map((school) => (
                  <span key={school}>{school}, </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Spells;
