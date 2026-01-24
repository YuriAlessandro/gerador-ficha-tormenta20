import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { SheetActionHistoryEntry } from '@/interfaces/CharacterSheet';
import { getAutoridadeEclesiasticaDynamicText } from '@/functions/powers/frade-special';
import PowerDisplay from './PowerDisplay';

function filterUnique<T>(array: T[]) {
  return array.filter((v, i, a) => a.indexOf(v) === i);
}

const PowersDisplay: React.FC<{
  sheetHistory: SheetActionHistoryEntry[];
  classPowers: ClassPower[];
  raceAbilities: RaceAbility[];
  classAbilities: ClassAbility[];
  originPowers: OriginPower[];
  deityPowers: GeneralPower[];
  generalPowers: GeneralPower[];
  className: string;
  raceName: string;
  deityName?: string;
  onUpdateRolls?: (
    power: ClassPower | RaceAbility | ClassAbility | OriginPower | GeneralPower,
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
  const powers = [
    ...processedClassPowers,
    ...raceAbilities,
    ...classAbilities,
    ...originPowers,
    ...deityPowers,
    ...generalPowers,
  ];

  // Count how many times a power if the same name appears
  const powerCount: Record<string, number> = {};

  powers.forEach((power) => {
    powerCount[power.name] = (powerCount[power.name] || 0) + 1;
  });

  const uniquePowers = [
    ...filterUnique(processedClassPowers),
    ...filterUnique(raceAbilities),
    ...filterUnique(classAbilities),
    ...filterUnique(originPowers),
    ...filterUnique(deityPowers),
    ...filterUnique(generalPowers),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const getPowerOrigin = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower
  ) => {
    if (processedClassPowers.some((p) => p.name === pw.name)) {
      return `Poder de ${className}`;
    }
    if (raceAbilities.includes(pw as RaceAbility)) {
      return `Habilidade de ${raceName}`;
    }
    if (classAbilities.includes(pw as ClassAbility)) {
      return `Habilidade de ${className}`;
    }
    if (originPowers.includes(pw as OriginPower)) {
      return 'Poder de Origem';
    }
    if (deityPowers.includes(pw as GeneralPower)) {
      return 'Poder Divino';
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
