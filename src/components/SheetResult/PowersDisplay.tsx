import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { Box } from '@mui/material';
import React from 'react';
import PowerDisplay from './PowerDisplay';

function filterUnique<T>(array: T[]) {
  return array.filter((v, i, a) => a.indexOf(v) === i);
}

const PowersDisplay: React.FC<{
  classPowers: ClassPower[];
  raceAbilities: RaceAbility[];
  classAbilities: ClassAbility[];
  originPowers: OriginPower[];
  deityPowers: GeneralPower[];
  generalPowers: GeneralPower[];
  className: string;
  raceName: string;
}> = ({
  classPowers,
  raceAbilities,
  classAbilities,
  originPowers,
  deityPowers,
  generalPowers,
  className,
  raceName,
}) => {
  const powers = [
    ...classPowers,
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
    ...filterUnique(classPowers),
    ...filterUnique(raceAbilities),
    ...filterUnique(classAbilities),
    ...filterUnique(originPowers),
    ...filterUnique(deityPowers),
    ...filterUnique(generalPowers),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const getPowerOrigin = (
    pw: ClassPower | RaceAbility | ClassAbility | OriginPower
  ) => {
    if (classPowers.includes(pw as ClassPower)) {
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
          key={power.name}
          power={power}
          type={getPowerOrigin(power)}
          count={powerCount[power.name]}
        />
      ))}
    </Box>
  );
};
export default PowersDisplay;
