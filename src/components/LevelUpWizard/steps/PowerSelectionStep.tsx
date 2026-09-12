import React, { useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower } from '@/interfaces/Poderes';
import { formatRequirements } from '@/functions/requirementText';

interface PowerSelectionStepProps {
  classPowers: ClassPower[];
  generalPowers: GeneralPower[];
  selectedPowerChoice: 'class' | 'general' | 'almaLivre' | null;
  selectedClassPower: ClassPower | null;
  selectedGeneralPower: GeneralPower | null;
  onPowerChoiceChange: (choice: 'class' | 'general' | 'almaLivre') => void;
  onClassPowerSelect: (power: ClassPower) => void;
  onGeneralPowerSelect: (power: GeneralPower) => void;
  onAlmaLivrePowerSelect?: (power: ClassPower) => void;
  className: string;
  knownClassPowers?: string[];
  knownGeneralPowers?: string[];
  unavailableClassPowers?: string[];
  unavailableGeneralPowers?: string[];
  almaLivrePower?: ClassPower | null;
  almaLivreClassName?: string;
  almaLivrePowerAvailable?: boolean;
  /**
   * Opt-in do jogador para escolher poderes fora dos pré-requisitos. Desligado,
   * os reprovados ficam escondidos enquanto se navega (a busca ainda os
   * encontra, desabilitados); ligado, aparecem sempre e ficam escolhíveis.
   */
  allowOutOfRequirements?: boolean;
  onAllowOutOfRequirementsChange?: (allow: boolean) => void;
}

/**
 * Opt-in discreto para escolher poderes fora dos pré-requisitos — a filosofia
 * "te mostro como seguir a regra, mas quebre se quiser". Mesmo idioma visual do
 * "Só os que posso pegar" do editor de poderes da ficha pronta.
 */
const OutOfRequirementsToggle: React.FC<{
  checked: boolean;
  onChange: (allow: boolean) => void;
}> = ({ checked, onChange }) => (
  <FormControlLabel
    sx={{ ml: 0, mr: 0, mb: 2, gap: 1 }}
    control={
      <Checkbox
        size='small'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        slotProps={{
          input: { 'aria-label': 'Mostrar poderes fora dos requisitos' },
        }}
      />
    }
    label={
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Mostrar poderes fora dos requisitos
      </Typography>
    }
  />
);

const PowerSelectionStep: React.FC<PowerSelectionStepProps> = ({
  classPowers,
  generalPowers,
  selectedPowerChoice,
  selectedClassPower,
  selectedGeneralPower,
  onPowerChoiceChange,
  onClassPowerSelect,
  onGeneralPowerSelect,
  onAlmaLivrePowerSelect,
  className,
  knownClassPowers = [],
  knownGeneralPowers = [],
  unavailableClassPowers = [],
  unavailableGeneralPowers = [],
  almaLivrePower = null,
  almaLivreClassName,
  almaLivrePowerAvailable = false,
  allowOutOfRequirements = false,
  onAllowOutOfRequirementsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Só os SELECIONÁVEIS entram na contagem do rótulo: `classPowers`/
  // `generalPowers` também trazem os reprovados por pré-requisito (para
  // mostrar o motivo), e o rótulo dos poderes gerais prometia ~300 opções onde
  // havia ~50. Com o opt-in ligado, os reprovados passam a contar.
  const selectableOf = <T extends ClassPower | GeneralPower>(
    powers: T[],
    unavailable: string[]
  ): T[] =>
    allowOutOfRequirements
      ? powers
      : powers.filter((power) => !unavailable.includes(power.name));

  const selectableClassPowers = selectableOf(
    classPowers,
    unavailableClassPowers
  );
  const selectableGeneralPowers = selectableOf(
    generalPowers,
    unavailableGeneralPowers
  );
  // A aba, porém, abre com QUALQUER poder no catálogo, mesmo que nenhum seja
  // escolhível: é lá dentro que mora o opt-in "fora dos requisitos". Travar o
  // radio pela contagem de escolhíveis deixaria a escape hatch inalcançável
  // justamente em quem mais precisa dela.
  const hasClassPowers = classPowers.length > 0;
  const hasGeneralPowers = generalPowers.length > 0;

  // Helper to check if power is already known and cannot be repeated
  const isPowerKnown = (powerName: string, isClassPower: boolean): boolean => {
    if (isClassPower) {
      if (!knownClassPowers.includes(powerName)) return false;
      // Power is known - check if it can repeat
      const power = classPowers.find((p) => p.name === powerName);
      return !power?.canRepeat;
    }
    if (!knownGeneralPowers.includes(powerName)) return false;
    // Power is known - check if it can be picked several times
    const power = generalPowers.find((p) => p.name === powerName);
    return !power?.allowSeveralPicks;
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

  // Escondidos só enquanto se NAVEGA. Com busca digitada a lista volta a
  // mostrar os reprovados (acinzentados, com o requisito à vista), pra ninguém
  // procurar um poder pelo nome e concluir que ele não existe.
  const visiblePowers = <T extends ClassPower | GeneralPower>(
    all: T[],
    selectablePowers: T[]
  ): T[] => filterPowers(searchQuery ? all : selectablePowers);

  const filteredClassPowers = visiblePowers(classPowers, selectableClassPowers);
  const filteredGeneralPowers = visiblePowers(
    generalPowers,
    selectableGeneralPowers
  );

  const hasAlmaLivre = almaLivrePower !== null;

  // Determine if step is complete
  const isComplete =
    (selectedPowerChoice === 'class' && selectedClassPower !== null) ||
    (selectedPowerChoice === 'general' && selectedGeneralPower !== null) ||
    (selectedPowerChoice === 'almaLivre' &&
      hasAlmaLivre &&
      almaLivrePowerAvailable);

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Escolha um Poder
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 3,
        }}
      >
        A cada nível, você pode escolher um poder de classe ou um poder geral.
        {hasAlmaLivre &&
          ' Você também pode escolher o poder de Alma Livre.'}{' '}
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
            onPowerChoiceChange(
              e.target.value as 'class' | 'general' | 'almaLivre'
            )
          }
        >
          <FormControlLabel
            value='class'
            control={<Radio />}
            label={`Poder de ${className} (${selectableClassPowers.length} disponíveis)`}
            disabled={!hasClassPowers}
          />
          <FormControlLabel
            value='general'
            control={<Radio />}
            label={`Poder Geral (${selectableGeneralPowers.length} disponíveis)`}
            disabled={!hasGeneralPowers}
          />
          {hasAlmaLivre && almaLivreClassName && (
            <FormControlLabel
              value='almaLivre'
              control={<Radio />}
              label={`Poder de Alma Livre — ${almaLivreClassName} (${
                almaLivrePower!.name
              })`}
            />
          )}
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
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          {onAllowOutOfRequirementsChange && (
            <OutOfRequirementsToggle
              checked={allowOutOfRequirements}
              onChange={onAllowOutOfRequirementsChange}
            />
          )}

          {filteredClassPowers.length === 0 &&
            !searchQuery &&
            !allowOutOfRequirements && (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                Nenhum poder de classe cujos pré-requisitos você cumpra. Marque
                a opção acima para escolher fora dos requisitos.
              </Typography>
            )}

          {filteredClassPowers.length === 0 && searchQuery && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Nenhum poder encontrado para &quot;{searchQuery}&quot;
            </Typography>
          )}

          <Stack spacing={2}>
            {filteredClassPowers.map((power) => {
              const isKnown = isPowerKnown(power.name, true);
              const isUnavailable = unavailableClassPowers.includes(power.name);
              const isUnlocked = isUnavailable && allowOutOfRequirements;
              const isDisabled = isKnown || (isUnavailable && !isUnlocked);
              return (
                <Card
                  key={power.name}
                  variant='outlined'
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    border: selectedClassPower?.name === power.name ? 2 : 1,
                    borderColor:
                      selectedClassPower?.name === power.name
                        ? 'primary.main'
                        : 'divider',
                    opacity: isDisabled ? 0.5 : 1,
                    '&:hover': {
                      borderColor: isDisabled ? 'divider' : 'primary.light',
                      bgcolor: isDisabled ? 'inherit' : 'action.hover',
                    },
                  }}
                  onClick={() => {
                    if (!isDisabled) {
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
                        {isUnavailable && (
                          <Chip
                            label={
                              isUnlocked
                                ? 'Fora dos pré-requisitos'
                                : 'Indisponível'
                            }
                            size='small'
                            color={isUnlocked ? 'default' : 'warning'}
                            variant={isUnlocked ? 'outlined' : 'filled'}
                          />
                        )}
                        {power.canRepeat && (
                          <Chip label='Repetível' size='small' color='info' />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {power.text}
                    </Typography>
                    {power.requirements && power.requirements.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          Pré-requisitos:{' '}
                          {formatRequirements(power.requirements)}
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
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          {onAllowOutOfRequirementsChange && (
            <OutOfRequirementsToggle
              checked={allowOutOfRequirements}
              onChange={onAllowOutOfRequirementsChange}
            />
          )}

          {filteredGeneralPowers.length === 0 &&
            !searchQuery &&
            !allowOutOfRequirements && (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                Nenhum poder geral cujos pré-requisitos você cumpra. Marque a
                opção acima para escolher fora dos requisitos.
              </Typography>
            )}

          {filteredGeneralPowers.length === 0 && searchQuery && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Nenhum poder encontrado para &quot;{searchQuery}&quot;
            </Typography>
          )}

          <Stack spacing={2}>
            {filteredGeneralPowers.map((power) => {
              const isKnown = isPowerKnown(power.name, false);
              const isUnavailable = unavailableGeneralPowers.includes(
                power.name
              );
              const isUnlocked = isUnavailable && allowOutOfRequirements;
              const isDisabled = isKnown || (isUnavailable && !isUnlocked);
              return (
                <Card
                  key={power.name}
                  variant='outlined'
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    border: selectedGeneralPower?.name === power.name ? 2 : 1,
                    borderColor:
                      selectedGeneralPower?.name === power.name
                        ? 'primary.main'
                        : 'divider',
                    opacity: isDisabled ? 0.5 : 1,
                    '&:hover': {
                      borderColor: isDisabled ? 'divider' : 'primary.light',
                      bgcolor: isDisabled ? 'inherit' : 'action.hover',
                    },
                  }}
                  onClick={() => {
                    if (!isDisabled) {
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
                        {isUnavailable && (
                          <Chip
                            label={
                              isUnlocked
                                ? 'Fora dos pré-requisitos'
                                : 'Indisponível'
                            }
                            size='small'
                            color={isUnlocked ? 'default' : 'warning'}
                            variant={isUnlocked ? 'outlined' : 'filled'}
                          />
                        )}
                        {power.allowSeveralPicks && (
                          <Chip label='Repetível' size='small' color='info' />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {power.description}
                    </Typography>
                    {power.requirements && power.requirements.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          Pré-requisitos:{' '}
                          {formatRequirements(power.requirements)}
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
      {selectedPowerChoice === 'almaLivre' &&
        hasAlmaLivre &&
        almaLivreClassName && (
          <Box>
            <Typography variant='subtitle1' gutterBottom>
              Poder de Alma Livre — {almaLivreClassName}
            </Typography>

            <Card
              variant='outlined'
              sx={{
                cursor: almaLivrePowerAvailable ? 'pointer' : 'not-allowed',
                border: 2,
                borderColor: almaLivrePowerAvailable
                  ? 'primary.main'
                  : 'divider',
                opacity: almaLivrePowerAvailable ? 1 : 0.5,
                '&:hover': {
                  borderColor: almaLivrePowerAvailable
                    ? 'primary.light'
                    : 'divider',
                  bgcolor: almaLivrePowerAvailable ? 'action.hover' : 'inherit',
                },
              }}
              onClick={() => {
                if (almaLivrePowerAvailable && onAlmaLivrePowerSelect) {
                  onAlmaLivrePowerSelect(almaLivrePower!);
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
                  <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                    {almaLivrePower!.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!almaLivrePowerAvailable && (
                      <Chip
                        label='Requisitos não atendidos'
                        size='small'
                        color='warning'
                      />
                    )}
                    <Chip
                      label='Alma Livre'
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                  </Box>
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {almaLivrePower!.text}
                </Typography>
                {almaLivrePower!.requirements &&
                  almaLivrePower!.requirements.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        Pré-requisitos:{' '}
                        {formatRequirements(almaLivrePower!.requirements, {
                          levelSuffix: ' (efetivo: nível −4)',
                        })}
                      </Typography>
                    </Box>
                  )}
                {!almaLivrePowerAvailable && (
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'warning.main',
                      mt: 1,
                    }}
                  >
                    Você ainda não atende aos requisitos deste poder (nível
                    efetivo = seu nível − 4).
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      {!hasClassPowers && !hasGeneralPowers && !hasAlmaLivre && (
        <Typography variant='body2' color='error'>
          Nenhum poder disponível para este nível. Isso não deveria acontecer -
          por favor, reporte este bug.
        </Typography>
      )}
      {selectedPowerChoice && !isComplete && (
        <Typography
          variant='body2'
          sx={{
            color: 'warning.main',
            mt: 2,
          }}
        >
          Selecione um poder para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default PowerSelectionStep;
