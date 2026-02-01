import React, { useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower, RequirementType } from '@/interfaces/Poderes';

interface PowerSelectionStepProps {
  classPowers: ClassPower[];
  generalPowers: GeneralPower[];
  selectedPowerChoice: 'class' | 'general' | null;
  selectedClassPower: ClassPower | null;
  selectedGeneralPower: GeneralPower | null;
  onPowerChoiceChange: (choice: 'class' | 'general') => void;
  onClassPowerSelect: (power: ClassPower) => void;
  onGeneralPowerSelect: (power: GeneralPower) => void;
  className: string;
  knownClassPowers?: string[];
  knownGeneralPowers?: string[];
}

const PowerSelectionStep: React.FC<PowerSelectionStepProps> = ({
  classPowers,
  generalPowers,
  selectedPowerChoice,
  selectedClassPower,
  selectedGeneralPower,
  onPowerChoiceChange,
  onClassPowerSelect,
  onGeneralPowerSelect,
  className,
  knownClassPowers = [],
  knownGeneralPowers = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const hasClassPowers = classPowers.length > 0;
  const hasGeneralPowers = generalPowers.length > 0;

  // Helper to check if power is already known
  const isPowerKnown = (powerName: string, isClassPower: boolean): boolean => {
    if (isClassPower) {
      return knownClassPowers.includes(powerName);
    }
    return knownGeneralPowers.includes(powerName);
  };

  // Filter powers by search query
  const filterPowers = <T extends ClassPower | GeneralPower>(
    powers: T[]
  ): T[] => {
    if (!searchQuery) return powers;

    const lowerQuery = searchQuery.toLowerCase();
    return powers.filter((power) => {
      const name = power.name.toLowerCase();
      const description =
        'text' in power
          ? power.text.toLowerCase()
          : power.description.toLowerCase();
      return name.includes(lowerQuery) || description.includes(lowerQuery);
    });
  };

  const filteredClassPowers = filterPowers(classPowers);
  const filteredGeneralPowers = filterPowers(generalPowers);

  // Determine if step is complete
  const isComplete =
    (selectedPowerChoice === 'class' && selectedClassPower !== null) ||
    (selectedPowerChoice === 'general' && selectedGeneralPower !== null);

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Escolha um Poder
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        A cada nível, você pode escolher um poder de classe ou um poder geral.
        Selecione o tipo de poder e depois escolha qual poder deseja adicionar.
      </Typography>

      {/* Step 1: Choose power type */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='subtitle1' gutterBottom>
          Tipo de Poder
        </Typography>
        <RadioGroup
          value={selectedPowerChoice || ''}
          onChange={(e) =>
            onPowerChoiceChange(e.target.value as 'class' | 'general')
          }
        >
          <FormControlLabel
            value='class'
            control={<Radio />}
            label={`Poder de ${className} (${classPowers.length} disponíveis)`}
            disabled={!hasClassPowers}
          />
          <FormControlLabel
            value='general'
            control={<Radio />}
            label={`Poder Geral (${generalPowers.length} disponíveis)`}
            disabled={!hasGeneralPowers}
          />
        </RadioGroup>
      </Box>

      {/* Step 2: Show available powers based on choice */}
      {selectedPowerChoice === 'class' && hasClassPowers && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Poderes de {className} Disponíveis
          </Typography>

          {/* Search field */}
          <TextField
            fullWidth
            size='small'
            placeholder='Buscar poderes por nome ou descrição...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {filteredClassPowers.length === 0 && searchQuery && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Nenhum poder encontrado para &quot;{searchQuery}&quot;
            </Typography>
          )}

          <Stack spacing={2}>
            {filteredClassPowers.map((power) => {
              const isKnown = isPowerKnown(power.name, true);
              return (
                <Card
                  key={power.name}
                  variant='outlined'
                  sx={{
                    cursor: isKnown ? 'not-allowed' : 'pointer',
                    border: selectedClassPower?.name === power.name ? 2 : 1,
                    borderColor:
                      selectedClassPower?.name === power.name
                        ? 'primary.main'
                        : 'divider',
                    opacity: isKnown ? 0.5 : 1,
                    '&:hover': {
                      borderColor: isKnown ? 'divider' : 'primary.light',
                      bgcolor: isKnown ? 'inherit' : 'action.hover',
                    },
                  }}
                  onClick={() => {
                    if (!isKnown) {
                      onClassPowerSelect(power);
                    }
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        {power.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isKnown && (
                          <Chip
                            label='Já Conhecido'
                            size='small'
                            color='default'
                          />
                        )}
                        {power.canRepeat && (
                          <Chip label='Repetível' size='small' color='info' />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {power.text}
                    </Typography>
                    {power.requirements && power.requirements.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Pré-requisitos:{' '}
                          {power.requirements
                            .map((reqGroup) =>
                              reqGroup
                                .map((req) => {
                                  switch (req.type) {
                                    case RequirementType.NIVEL:
                                      return `Nível ${req.value}`;
                                    case RequirementType.PODER:
                                      return req.name;
                                    case RequirementType.ATRIBUTO:
                                      return `${req.name} ${req.value}`;
                                    case RequirementType.PERICIA:
                                      return `Treinado em ${req.name}`;
                                    case RequirementType.HABILIDADE:
                                      return req.not
                                        ? `Não ter ${req.name}`
                                        : req.name;
                                    case RequirementType.PROFICIENCIA:
                                      return `Proficiência: ${req.value}`;
                                    case RequirementType.CLASSE:
                                      return `Classe: ${req.value}`;
                                    case RequirementType.TIPO_ARCANISTA:
                                      return req.name;
                                    case RequirementType.MAGIA:
                                      return `Magia: ${req.name}`;
                                    case RequirementType.DEVOTO:
                                      return req.name === 'any'
                                        ? 'Devoto de qualquer divindade'
                                        : `Devoto de ${req.name}`;
                                    case RequirementType.RACA:
                                      return `Raça: ${req.name}`;
                                    case RequirementType.TEXT:
                                      return req.name || '';
                                    default:
                                      return '';
                                  }
                                })
                                .filter((text) => text !== '')
                                .join(' e ')
                            )
                            .filter((text) => text !== '')
                            .join(' OU ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

      {selectedPowerChoice === 'general' && hasGeneralPowers && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Poderes Gerais Disponíveis
          </Typography>

          {/* Search field */}
          <TextField
            fullWidth
            size='small'
            placeholder='Buscar poderes por nome ou descrição...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {filteredGeneralPowers.length === 0 && searchQuery && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Nenhum poder encontrado para &quot;{searchQuery}&quot;
            </Typography>
          )}

          <Stack spacing={2}>
            {filteredGeneralPowers.map((power) => {
              const isKnown = isPowerKnown(power.name, false);
              return (
                <Card
                  key={power.name}
                  variant='outlined'
                  sx={{
                    cursor: isKnown ? 'not-allowed' : 'pointer',
                    border: selectedGeneralPower?.name === power.name ? 2 : 1,
                    borderColor:
                      selectedGeneralPower?.name === power.name
                        ? 'primary.main'
                        : 'divider',
                    opacity: isKnown ? 0.5 : 1,
                    '&:hover': {
                      borderColor: isKnown ? 'divider' : 'primary.light',
                      bgcolor: isKnown ? 'inherit' : 'action.hover',
                    },
                  }}
                  onClick={() => {
                    if (!isKnown) {
                      onGeneralPowerSelect(power);
                    }
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        {power.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isKnown && (
                          <Chip
                            label='Já Conhecido'
                            size='small'
                            color='default'
                          />
                        )}
                        {power.allowSeveralPicks && (
                          <Chip label='Repetível' size='small' color='info' />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {power.description}
                    </Typography>
                    {power.requirements && power.requirements.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Pré-requisitos:{' '}
                          {power.requirements
                            .map((reqGroup) =>
                              reqGroup
                                .map((req) => {
                                  switch (req.type) {
                                    case RequirementType.NIVEL:
                                      return `Nível ${req.value}`;
                                    case RequirementType.PODER:
                                      return req.name;
                                    case RequirementType.ATRIBUTO:
                                      return `${req.name} ${req.value}`;
                                    case RequirementType.PERICIA:
                                      return `Treinado em ${req.name}`;
                                    case RequirementType.HABILIDADE:
                                      return req.not
                                        ? `Não ter ${req.name}`
                                        : req.name;
                                    case RequirementType.PROFICIENCIA:
                                      return `Proficiência: ${req.value}`;
                                    case RequirementType.CLASSE:
                                      return `Classe: ${req.value}`;
                                    case RequirementType.TIPO_ARCANISTA:
                                      return req.name;
                                    case RequirementType.MAGIA:
                                      return `Magia: ${req.name}`;
                                    case RequirementType.DEVOTO:
                                      return req.name === 'any'
                                        ? 'Devoto de qualquer divindade'
                                        : `Devoto de ${req.name}`;
                                    case RequirementType.RACA:
                                      return `Raça: ${req.name}`;
                                    case RequirementType.TEXT:
                                      return req.name || '';
                                    default:
                                      return '';
                                  }
                                })
                                .filter((text) => text !== '')
                                .join(' e ')
                            )
                            .filter((text) => text !== '')
                            .join(' OU ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

      {!hasClassPowers && !hasGeneralPowers && (
        <Typography variant='body2' color='error'>
          Nenhum poder disponível para este nível. Isso não deveria acontecer -
          por favor, reporte este bug.
        </Typography>
      )}

      {selectedPowerChoice && !isComplete && (
        <Typography variant='body2' color='warning.main' sx={{ mt: 2 }}>
          Selecione um poder para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default PowerSelectionStep;
