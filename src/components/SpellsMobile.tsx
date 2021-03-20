import React from 'react';
import '../assets/css/result.css';
import { manaExpenseByCircle } from '../data/magias/generalSpells';
import { CharacterAttribute } from '../interfaces/Character';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
  keyAttr: CharacterAttribute | null;
  nivel: number;
}

const SpellsMobile: React.FC<SpellsProp> = (props) => {
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
          </span>
        </div>
      )}
      {spells.length === 0 ? (
        <span>Não Possui</span>
      ) : (
        <div>
          <div>
            {spells.map((spell) => (
              <div key={spell.nome} className='spellMobile'>
                <div className='spellName'>
                  ({manaExpenseByCircle[spell.spellCircle]}) {spell.nome}
                </div>
                <div>
                  <strong>- Escola: </strong> {spell.school}
                </div>
                <div>
                  <strong>- Execução: </strong> {spell.execucao}
                </div>
                <div>
                  <strong>- Alcance: </strong> {spell.alcance}
                </div>
                <div>
                  <strong>- Alvo/Área: </strong>{' '}
                  {spell.alvo || spell.area || '-'}
                </div>
                <div>
                  <strong>- Duração: </strong> {spell.duracao}
                </div>
                <div>
                  <strong>- Resistência: </strong> {spell.resistencia || '-'}
                </div>
                {spell.manaReduction && (
                  <div>
                    - Você tem {spell.manaReduction} de redução de mana para a
                    pagia {spell.nome}
                  </div>
                )}
              </div>
            ))}
          </div>

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

export default SpellsMobile;
