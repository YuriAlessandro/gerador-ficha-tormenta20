import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Chip, Typography } from '@mui/material';
import { PowerAvailability } from '@/functions/powers/requirementEvaluation';
import { REQUIREMENT_CHIP_SX } from './powersEditorStyles';

interface PowerRequirementsProps {
  availability: PowerAvailability;
}

/**
 * Os pré-requisitos de um poder, um chip por requisito.
 *
 * O editor antigo dizia apenas que o poder estava indisponível, pintando a
 * caixa inteira de vermelho, e listava os requisitos como uma frase corrida.
 * Quem não podia pegar o poder tinha que comparar a frase com a ficha na mão
 * para descobrir o que faltava. Aqui cada requisito diz se está atendido e,
 * quando dá para medir, quanto o personagem tem.
 */
const PowerRequirements: React.FC<PowerRequirementsProps> = ({
  availability,
}) => {
  // Sem pré-requisito não há o que dizer — uma linha "Nenhum pré-requisito"
  // só ocuparia espaço em quase todo poder da lista.
  if (availability.bypassed || availability.groups.length === 0) return null;

  return (
    <Box sx={{ mt: 0.75 }}>
      {availability.groups.map((group, groupIndex) => (
        <Box
          // Grupos não têm identidade própria nos dados; a posição é a chave.
          // eslint-disable-next-line react/no-array-index-key
          key={`group-${groupIndex}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {groupIndex > 0 && (
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', fontStyle: 'italic', mr: 0.25 }}
            >
              ou
            </Typography>
          )}
          {group.requirements.map((req) => (
            <Chip
              key={`${req.label}-${req.met}`}
              size='small'
              variant='outlined'
              color={req.met ? 'success' : 'error'}
              sx={REQUIREMENT_CHIP_SX}
              icon={
                req.met ? (
                  <CheckIcon fontSize='small' />
                ) : (
                  <CloseIcon fontSize='small' />
                )
              }
              label={req.current ? `${req.label} — ${req.current}` : req.label}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PowerRequirements;
