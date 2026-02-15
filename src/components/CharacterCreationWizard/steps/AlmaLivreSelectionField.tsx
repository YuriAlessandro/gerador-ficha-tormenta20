import React, { useMemo, useState } from 'react';
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
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ClassDescription, ClassPower } from '@/interfaces/Class';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { RequirementType } from '@/interfaces/Poderes';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';

interface AlmaLivreSelectionFieldProps {
  availableClasses: ClassDescription[];
  supplements: SupplementId[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const AlmaLivreSelectionField: React.FC<AlmaLivreSelectionFieldProps> = ({
  availableClasses,
  supplements,
  selections,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedClassName = selections.almaLivreClass || '';
  const selectedPower = selections.almaLivrePower;

  const sortedClasses = useMemo(
    () =>
      [...availableClasses].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      ),
    [availableClasses]
  );

  // Get the full class with supplement powers from registry
  const selectedClassPowers = useMemo(() => {
    if (!selectedClassName) return [];
    const classWithPowers = dataRegistry.getClassByName(
      selectedClassName,
      supplements
    );
    if (!classWithPowers) return [];
    return [...classWithPowers.powers].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    );
  }, [selectedClassName, supplements]);

  // Filter powers by search query
  const filteredPowers = useMemo(() => {
    if (!searchQuery) return selectedClassPowers;
    const lowerQuery = searchQuery.toLowerCase();
    return selectedClassPowers.filter(
      (power) =>
        power.name.toLowerCase().includes(lowerQuery) ||
        power.text.toLowerCase().includes(lowerQuery)
    );
  }, [selectedClassPowers, searchQuery]);

  const handleClassChange = (className: string) => {
    setSearchQuery('');
    onChange({
      almaLivreClass: className,
      almaLivrePower: undefined,
    });
  };

  const handlePowerSelect = (power: ClassPower) => {
    onChange({
      almaLivreClass: selectedClassName,
      almaLivrePower: power,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Alma Livre:</strong> Escolha uma classe diferente da sua. Você
          poderá escolher um poder dessa classe em uma subida de nível futura
          (nível efetivo = seu nível − 4). Você não recebe o poder agora, apenas
          o direito de escolhê-lo mais tarde.
        </Typography>
      </Alert>

      {/* Class Selection */}
      <FormControl fullWidth>
        <InputLabel id='alma-livre-class-label'>Classe *</InputLabel>
        <Select
          labelId='alma-livre-class-label'
          value={selectedClassName}
          label='Classe *'
          onChange={(e) => handleClassChange(e.target.value as string)}
        >
          {sortedClasses.map((cls) => (
            <MenuItem key={cls.name} value={cls.name}>
              {cls.isVariant ? `↳ ${cls.name}` : cls.name}
              {cls.isVariant && (
                <Chip
                  label='Variante'
                  size='small'
                  sx={{ ml: 1 }}
                  variant='outlined'
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Power Selection */}
      {selectedClassName && selectedClassPowers.length > 0 && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Poderes de {selectedClassName} ({selectedClassPowers.length}{' '}
            disponíveis)
          </Typography>

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

          {filteredPowers.length === 0 && searchQuery && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Nenhum poder encontrado para &quot;{searchQuery}&quot;
            </Typography>
          )}

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Stack spacing={2}>
              {filteredPowers.map((power) => (
                <Card
                  key={power.name}
                  variant='outlined'
                  sx={{
                    cursor: 'pointer',
                    border: selectedPower?.name === power.name ? 2 : 1,
                    borderColor:
                      selectedPower?.name === power.name
                        ? 'primary.main'
                        : 'divider',
                    '&:hover': {
                      borderColor: 'primary.light',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handlePowerSelect(power)}
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
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {selectedClassName && selectedClassPowers.length === 0 && (
        <Alert severity='warning'>
          Nenhum poder encontrado para a classe {selectedClassName}.
        </Alert>
      )}

      {/* Selection Summary */}
      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Resumo:</strong>{' '}
          {selectedClassName ? (
            <>
              Classe: <em>{selectedClassName}</em>
              {selectedPower ? (
                <>
                  {' — '}
                  Poder: <em>{selectedPower.name}</em>
                </>
              ) : (
                ' — Nenhum poder selecionado'
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

export default AlmaLivreSelectionField;
