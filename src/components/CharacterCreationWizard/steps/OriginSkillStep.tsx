import React from 'react';
import { Alert, Box, Divider, Typography } from '@mui/material';
import Origin, { OriginSkillChoice } from '@/interfaces/Origin';
import Skill, { isOficioSkill } from '@/interfaces/Skills';
import OficioPicker from '@/components/common/OficioPicker';
import { OriginSkillChoices } from '@/functions/originSkills';

interface OriginSkillStepProps {
  origin: Origin;
  skillChoices: OriginSkillChoice[];
  choices: OriginSkillChoices | undefined;
  onChange: (choices: OriginSkillChoices) => void;
}

const OriginSkillStep: React.FC<OriginSkillStepProps> = ({
  origin,
  skillChoices,
  choices,
  onChange,
}) => {
  const current = choices || {};

  const isComplete = skillChoices.every((choice) => !!current[choice.key]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        A origem {origin.name} concede estas perícias gratuitamente. Escolha o
        valor final de cada uma.
      </Typography>

      {skillChoices.map((choice, index) => {
        const selected = current[choice.key]
          ? [current[choice.key] as Skill]
          : [];

        return (
          <Box key={choice.key}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              {choice.label} — escolha 1:
            </Typography>
            {choice.options.every((option) => isOficioSkill(option)) ? (
              <OficioPicker
                selected={selected}
                options={choice.options}
                multiple={false}
                allowCustom
                onSelect={(skill) =>
                  onChange({ ...current, [choice.key]: skill })
                }
                onDeselect={() => {
                  const next = { ...current };
                  delete next[choice.key];
                  onChange(next);
                }}
              />
            ) : (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {choice.options.join(', ')}
              </Typography>
            )}
          </Box>
        );
      })}

      {!isComplete && (
        <Alert severity='warning'>
          Escolha todas as perícias para continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Perícias da origem selecionadas! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default OriginSkillStep;
