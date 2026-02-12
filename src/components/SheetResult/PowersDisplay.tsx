import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { SheetActionHistoryEntry } from '@/interfaces/CharacterSheet';
import { getAutoridadeEclesiasticaDynamicText } from '@/functions/powers/frade-special';
import { CustomPower } from '@/interfaces/CustomPower';
import PowerDisplay from './PowerDisplay';

function filterUniqueByName<T extends { name: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

const PowersDisplay: React.FC<{
  sheetHistory: SheetActionHistoryEntry[];
  classPowers: ClassPower[];
  raceAbilities: RaceAbility[];
  classAbilities: ClassAbility[];
  originPowers: OriginPower[];
  deityPowers: GeneralPower[];
  generalPowers: GeneralPower[];
  customPowers?: CustomPower[];
  className: string;
  raceName: string;
  deityName?: string;
  onUpdateRolls?: (
    power:
      | ClassPower
      | RaceAbility
      | ClassAbility
      | OriginPower
      | GeneralPower
      | CustomPower,
    newRolls: DiceRoll[]
  ) => void;
  characterName?: string;
}> = ({
  sheetHistory,
  classPowers,
  raceAbilities,
  classAbilities,
  originPowers,
  deityPowers,
  generalPowers,
  customPowers,
  className,
  raceName,
  deityName,
  onUpdateRolls,
  characterName,
}) => {
  // Aplica texto dinâmico para poderes que dependem da divindade
  const processedClassPowers = useMemo(
    () =>
      classPowers.map((power) => {
        if (power.name === 'Autoridade Eclesiástica') {
          const dynamicText = getAutoridadeEclesiasticaDynamicText(deityName);
          if (dynamicText) {
            return { ...power, dynamicText };
          }
        }
        return power;
      }),
    [classPowers, deityName]
  );
  // Filtra habilidades de classe cujo nome já exista como poder de classe
  // (ex: habilidade "Alquimista Iniciado" que auto-concede o poder de mesmo nome)
  const classPowerNames = new Set(processedClassPowers.map((p) => p.name));
  const filteredClassAbilities = classAbilities.filter(
    (ability) => !classPowerNames.has(ability.name)
  );

  const powers = [
    ...processedClassPowers,
    ...raceAbilities,
    ...filteredClassAbilities,
    ...originPowers,
    ...deityPowers,
    ...generalPowers,
    ...(customPowers || []),
  ];

  // Count how many times a power if the same name appears
  const powerCount: Record<string, number> = {};

  powers.forEach((power) => {
    powerCount[power.name] = (powerCount[power.name] || 0) + 1;
  });

  const uniquePowers = [
    ...filterUniqueByName(processedClassPowers),
    ...filterUniqueByName(raceAbilities),
    ...filterUniqueByName(filteredClassAbilities),
    ...filterUniqueByName(originPowers),
    ...filterUniqueByName(deityPowers),
    ...filterUniqueByName(generalPowers),
    ...filterUniqueByName(customPowers || []),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const getPowerOrigin = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower | CustomPower
  ) => {
    if (processedClassPowers.some((p) => p.name === pw.name)) {
      return `Poder de ${className}`;
    }
    if (raceAbilities.includes(pw as RaceAbility)) {
      return `Habilidade de ${raceName}`;
    }
    if (filteredClassAbilities.includes(pw as ClassAbility)) {
      return `Habilidade de ${className}`;
    }
    if (originPowers.includes(pw as OriginPower)) {
      return 'Poder de Origem';
    }
    if (deityPowers.includes(pw as GeneralPower)) {
      return 'Poder Divino';
    }
    if (customPowers?.some((p) => p.name === pw.name)) {
      return 'Poder Personalizado';
    }
    return 'Poder Geral';
  };

  return (
    <Box>
      {uniquePowers.map((power) => (
        <PowerDisplay
          sheetHistory={sheetHistory}
          key={power.name}
          power={power}
          type={getPowerOrigin(power)}
          count={powerCount[power.name]}
          onUpdateRolls={onUpdateRolls}
          characterName={characterName}
        />
      ))}
    </Box>
  );
};
export default PowersDisplay;
