import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { ClassAbility, ClassDescription } from '@/interfaces/Class';
import { SelectionOptions } from '@/interfaces/PowerSelections';

interface ClassAbilitySelectionFieldProps {
  availableClasses: ClassDescription[];
  abilityLevel: number;
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

/**
 * Escolha em dois passos para a ação `learnClassAbility` (origem "Duplo
 * Feérico"): primeiro a classe, depois uma habilidade dela no nível pedido.
 *
 * A classe é persistida assim que escolhida (com `abilityName: ''`) para
 * sobreviver à navegação entre passos do assistente. `countRequirementSelections`
 * só considera a escolha completa quando `abilityName` está preenchido.
 */
const ClassAbilitySelectionField: React.FC<ClassAbilitySelectionFieldProps> = ({
  availableClasses,
  abilityLevel,
  selections,
  onChange,
}) => {
  const selection = selections.classAbilities?.[0];
  const selectedClassName = selection?.className || '';
  const selectedAbilityName = selection?.abilityName || '';

  const sortedClasses = useMemo(
    () =>
      [...availableClasses].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      ),
    [availableClasses]
  );

  const levelAbilities = useMemo<ClassAbility[]>(() => {
    if (!selectedClassName) return [];
    const selectedClass = availableClasses.find(
      (cls) => cls.name === selectedClassName
    );
    if (!selectedClass) return [];
    return selectedClass.abilities.filter(
      (ability) => ability.nivel === abilityLevel
    );
  }, [availableClasses, selectedClassName, abilityLevel]);

  const handleClassChange = (className: string) => {
    onChange({ classAbilities: [{ className, abilityName: '' }] });
  };

  const handleAbilitySelect = (abilityName: string) => {
    onChange({
      classAbilities: [{ className: selectedClassName, abilityName }],
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Duplo Feérico:</strong> escolha uma habilidade de{' '}
          {abilityLevel}º nível de uma classe que não seja a sua. Você recebe
          essa habilidade e pode usá-la como se tivesse {abilityLevel} nível
          naquela classe.
        </Typography>
      </Alert>

      {/* Escolha da classe */}
      <FormControl fullWidth>
        <InputLabel id='class-ability-class-label'>Classe *</InputLabel>
        <Select
          labelId='class-ability-class-label'
          value={selectedClassName}
          label='Classe *'
          onChange={(e) => handleClassChange(e.target.value as string)}
        >
          {sortedClasses.map((cls) => (
            <MenuItem key={cls.name} value={cls.name}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Escolha da habilidade */}
      {selectedClassName && levelAbilities.length > 0 && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Habilidades de {abilityLevel}º nível de {selectedClassName}
          </Typography>

          <Stack spacing={2}>
            {levelAbilities.map((ability) => (
              <Card
                key={ability.name}
                variant='outlined'
                sx={{
                  cursor: 'pointer',
                  border: selectedAbilityName === ability.name ? 2 : 1,
                  borderColor:
                    selectedAbilityName === ability.name
                      ? 'primary.main'
                      : 'divider',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleAbilitySelect(ability.name)}
              >
                <CardContent>
                  <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                    {ability.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}
                  >
                    {ability.text}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {selectedClassName && levelAbilities.length === 0 && (
        <Alert severity='warning'>
          Nenhuma habilidade de {abilityLevel}º nível encontrada para a classe{' '}
          {selectedClassName}.
        </Alert>
      )}

      {/* Ressalva do livro para a habilidade Magias */}
      {selectedAbilityName === 'Magias' && (
        <Alert severity='warning'>
          <Typography variant='body2'>
            Ao escolher <strong>Magias</strong> você aprende uma única magia e
            recebe <strong>+1 PM</strong>, mas <strong>não</strong> soma o
            atributo-chave da habilidade no seu total de PM. O +1 PM já é
            aplicado automaticamente — a magia precisa ser adicionada por você
            na aba de Magias da ficha.
          </Typography>
        </Alert>
      )}

      {/* Resumo */}
      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          <strong>Resumo:</strong>{' '}
          {selectedClassName ? (
            <>
              Classe: <em>{selectedClassName}</em>
              {selectedAbilityName ? (
                <>
                  {' — '}
                  Habilidade: <em>{selectedAbilityName}</em>
                </>
              ) : (
                ' — Nenhuma habilidade selecionada'
              )}
            </>
          ) : (
            'Nenhuma classe selecionada'
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default ClassAbilitySelectionField;
