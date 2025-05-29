import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import { Box } from '@mui/material';
import React from 'react';
import PowerDisplay from './PowerDisplay';

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
      {powers.map((power) => (
        <PowerDisplay
          key={power.name}
          power={power}
          type={getPowerOrigin(power)}
        />
      ))}
    </Box>
  );
};
export default PowersDisplay;
