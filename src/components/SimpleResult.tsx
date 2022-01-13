/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { SkillsTotals } from '../interfaces/Skills';

interface ResultProps {
  sheet: CharacterSheet;
  isDarkMode: boolean;
}

const SimpleResult: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode } = props;

  function getKey(elementId: string) {
    return `${sheet.id}-${elementId}`;
  }

  const skillsTotals: SkillsTotals | any = {};

  sheet.completeSkills?.forEach((sk) => {
    const skTotal =
      (sk.halfLevel ?? 0) +
      (sk.modAttr ?? 0) +
      (sk.others ?? 0) +
      (sk.training ?? 0);

    skillsTotals[sk.name as any] = skTotal;
  });

  let bagEquipments;
  if (sheet.bag.getEquipments) {
    bagEquipments = sheet.bag.getEquipments();
  } else {
    bagEquipments = sheet.bag.equipments;
  }

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(
    bagEquipments
  ).flatMap((value) => value[1]);

  const fightSkill = skillsTotals.Luta;
  const rangeSkill = skillsTotals.Pontaria;

  return (
    <div className={`resultMainDiv ${isDarkMode ? 'dark' : ''}`}>
      <div className='simpleSeetName'>{sheet.nome}</div>
      {sheet.raca.name} {sheet.nivel}
      <div className='simpleSheetDivisor' />
      <div>
        <span className='simpleSheetText'>Iniciativa</span>{' '}
        {skillsTotals.Iniciativa > 0
          ? `+${skillsTotals.Iniciativa}`
          : skillsTotals.Iniciativa}
        ,<span className='simpleSheetText'> Percepção</span>{' '}
        {skillsTotals['Percepção'] > 0
          ? `+${skillsTotals['Percepção']}`
          : skillsTotals['Percepção']}
      </div>
      <div>
        <span className='simpleSheetText'>Defesa</span> {sheet.defesa},
        <span className='simpleSheetText'> Fort</span>{' '}
        {skillsTotals.Fortitude > 0
          ? `+${skillsTotals.Fortitude}`
          : skillsTotals.Fortitude}
        ,<span className='simpleSheetText'> Ref</span>{' '}
        {skillsTotals.Reflexos > 0
          ? `+${skillsTotals.Reflexos}`
          : skillsTotals.Reflexos}
        ,<span className='simpleSheetText'> Von</span>{' '}
        {skillsTotals.Vontade > 0
          ? `+${skillsTotals.Vontade}`
          : skillsTotals.Vontade}
      </div>
      <div>
        <span className='simpleSheetText'>Pontos de Vida</span> {sheet.pv}
      </div>
      <div>
        <span className='simpleSheetText'>Deslocamento</span>{' '}
        {sheet.displacement}m ({sheet.displacement / 1.5}q)
      </div>
      <div className='simpleSheetDivisor' />
      {sheet.pm > 0 && (
        <div>
          <span className='simpleSheetText'>Pontos de Mana</span> {sheet.pm}
        </div>
      )}
      <div>
        <span className='simpleSheetText'>Ataques</span>
      </div>
      {sheet.bag.equipments.Arma.map((eq) => {
        const isRange = eq.alcance && eq.alcance !== '-';
        const modAtk = isRange ? rangeSkill : fightSkill;
        return (
          <div key={getKey(eq.nome)}>
            {eq.nome} {modAtk > 0 ? `+${modAtk}` : modAtk} ({eq.dano}
            {isRange ? '' : `+${sheet.atributos.Força.mod}`}, {eq.critico})
          </div>
        );
      })}
      <div className='simpleSheetDivisor' />
      <div>
        <span className='simpleSheetText'>
          FOR {sheet.atributos.Força.value}, DES{' '}
          {sheet.atributos.Destreza.value}, CON{' '}
          {sheet.atributos.Constituição.value}, INT{' '}
          {sheet.atributos.Inteligência.value}, SAB{' '}
          {sheet.atributos.Sabedoria.value}, CAR {sheet.atributos.Carisma.value}
        </span>
      </div>
      <div className='simpleSheetDivisor' />
      <div>
        <span className='simpleSheetText'>Equipamento</span>{' '}
        {equipsEntriesNoWeapons.map((eq, idx) => (
          <span key={getKey(eq.nome)}>
            {eq.nome}
            {idx + 1 < equipsEntriesNoWeapons.length ? ', ' : '.'}
          </span>
        ))}
      </div>
      <div className='simpleSheetDivisor' />
      {/* Poderes de Raça */}
      {sheet.raca.abilities?.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.description}
        </div>
      ))}
      <div className='simpleSheetDivisor' />
      {/* Habilidades de Classe */}
      {sheet.classe.abilities?.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.text}
        </div>
      ))}
      {/* Poderes de Classe */}
      <div className='simpleSheetDivisor' />
      {sheet.classPowers?.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.text}
        </div>
      ))}
      {sheet.origin?.powers && sheet.origin?.powers.length > 0 && (
        <div className='simpleSheetDivisor' />
      )}
      {/* Poderes de Origem */}
      {sheet.origin?.powers.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.description}
        </div>
      ))}
      <div className='simpleSheetDivisor' />
      {/* Poderes gerais */}
      {sheet.generalPowers?.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.description}
        </div>
      ))}
      {/* Poderes concedidos */}
      <div className='simpleSheetDivisor' />
      {sheet.devoto?.poderes.map((power) => (
        <div key={getKey(power.name)}>
          <span className='simpleSheetText'>{power.name}: </span>
          {power.description}
        </div>
      ))}
      {/* Mágias */}
      {sheet.spells.length > 0 && (
        <div>
          <div className='simpleSheetDivisor' />
          <span className='simpleSheetText'>Magias </span>
          {sheet.spells.map((spl, idx) => (
            <span key={getKey(spl.nome)}>
              {spl.nome}
              {idx + 1 < sheet.spells.length ? ', ' : '.'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleResult;
