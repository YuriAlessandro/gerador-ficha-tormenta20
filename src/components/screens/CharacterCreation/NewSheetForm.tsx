import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Select, { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import SelectOptions from '../../../interfaces/SelectedOptions';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../../types/supplement.types';
import {
  allDivindadeNames,
  divindadeDisplayNames,
} from '../../../interfaces/Divindade';
import {
  dataRegistry,
  RaceWithSupplement,
  ClassWithSupplement,
  OriginWithSupplement,
} from '../../../data/registry';
import getSelectTheme from '../../../functions/style';
import { raceHasOrigin } from '../../../data/systems/tormenta20/origins';

type SelectedOption = {
  value: string;
  label: string;
  supplementId?: SupplementId;
  supplementName?: string;
};

interface NewSheetFormProps {
  isDarkMode: boolean;
  selectedOptions: SelectOptions;
  onSelectedOptionsChange: (options: SelectOptions) => void;
  simpleSheet: boolean;
  onSimpleSheetChange: (value: boolean) => void;
  onCreateSheet: () => void;
  userSupplements: SupplementId[];
  enabledSupplements?: SupplementId[];
}

const formatOptionLabel = (option: SelectedOption) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span>{option.label}</span>
    {option.supplementId &&
      option.supplementId !== SupplementId.TORMENTA20_CORE && (
        <Chip
          label={option.supplementName}
          size='small'
          sx={{
            height: '20px',
            fontSize: '0.75rem',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }}
        />
      )}
  </div>
);

const NewSheetForm: React.FC<NewSheetFormProps> = ({
  isDarkMode,
  selectedOptions,
  onSelectedOptionsChange,
  simpleSheet,
  onSimpleSheetChange,
  onCreateSheet,
  userSupplements,
  enabledSupplements,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const RACAS = dataRegistry.getRacesWithSupplementInfo(userSupplements);
  const CLASSES = dataRegistry.getClassesWithSupplementInfo(userSupplements);

  // Validation: all required fields must be filled (no random values)
  const canCreateSheet =
    selectedOptions.classe &&
    selectedOptions.raca &&
    (raceHasOrigin(selectedOptions.raca) ? selectedOptions.origin : true) &&
    selectedOptions.nivel &&
    selectedOptions.devocao.value !== '';

  const onSelectRaca = (raca: SelectedOption | null) => {
    onSelectedOptionsChange({ ...selectedOptions, raca: raca?.value ?? '' });
  };

  const onSelectClasse = (classe: SelectedOption | null) => {
    onSelectedOptionsChange({
      ...selectedOptions,
      classe: classe?.value ?? '',
      devocao: { label: 'Não devoto', value: '--' },
    });
  };

  const onSelectOrigin = (origin: SelectedOption | null) => {
    onSelectedOptionsChange({
      ...selectedOptions,
      origin: origin?.value ?? '',
    });
  };

  const inSelectDivindade = (divindade: SelectedOption | null) => {
    onSelectedOptionsChange({
      ...selectedOptions,
      devocao: divindade ?? { label: 'Não devoto', value: '--' },
    });
  };

  const onSelectNivel = (nivel: SelectedOption | null) => {
    if (nivel) {
      const selectedNivel = parseInt(nivel.value, 10);
      onSelectedOptionsChange({ ...selectedOptions, nivel: selectedNivel });
    }
  };

  // NO "Aleatoria" options - only actual values
  const racas = React.useMemo<SelectedOption[]>(
    () =>
      RACAS.map((raca: RaceWithSupplement) => ({
        value: raca.name,
        label: raca.name,
        supplementId: raca.supplementId,
        supplementName: raca.supplementName,
      })),
    [RACAS]
  );

  const classesopt = React.useMemo<SelectedOption[]>(
    () =>
      CLASSES.map((classe: ClassWithSupplement) => ({
        value: classe.name,
        label: classe.name,
        supplementId: classe.supplementId,
        supplementName: classe.supplementName,
      })),
    [CLASSES]
  );

  const niveis = React.useMemo<{ value: string; label: string }[]>(() => {
    const result: { value: string; label: string }[] = [];
    for (let index = 1; index < 21; index += 1) {
      result.push({
        value: index as unknown as string,
        label: `Nível ${index}`,
      });
    }
    return result;
  }, []);

  const origens = React.useMemo<SelectedOption[]>(
    () =>
      dataRegistry
        .getOriginsBySupplements(userSupplements)
        .map((origin: OriginWithSupplement) => ({
          value: origin.name,
          label: origin.name,
          supplementId: origin.supplementId,
          supplementName: origin.supplementName,
        })),
    [userSupplements]
  );

  // NO "Aleatorio" in divindades - only actual deities and "Nao devoto"
  // Sorted alphabetically by display name
  const divindades = React.useMemo(
    () =>
      allDivindadeNames
        .filter((dv) => {
          if (selectedOptions.classe) {
            const classe = CLASSES.find(
              (c) => c.name === selectedOptions.classe
            );
            if (classe) return classe?.faithProbability?.[dv] !== 0;
            return true;
          }
          return true;
        })
        .map((sdv) => ({
          value: sdv,
          label: divindadeDisplayNames[sdv],
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
    [selectedOptions.classe, CLASSES]
  );

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const selectStyles: Partial<StylesConfig<SelectedOption, false>> = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided) => ({
      ...provided,
      minHeight: isMobile ? '44px' : '38px',
      fontSize: isMobile ? '16px' : '14px',
    }),
    option: (provided, state) => {
      const getOptionBg = () => {
        if (state.isSelected) return isDarkMode ? '#d13235' : '#deebff';
        if (state.isFocused) return isDarkMode ? '#363636' : '#f2f2f2';
        return isDarkMode ? '#3D3D3D' : '#ffffff';
      };
      return {
        ...provided,
        fontSize: isMobile ? '16px' : '14px',
        padding: isMobile ? '12px' : '8px 12px',
        color: isDarkMode ? '#FAFAFA' : '#333333',
        backgroundColor: getOptionBg(),
        ':active': {
          backgroundColor: isDarkMode ? '#d13235' : '#b2d4ff',
        },
      };
    },
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: isDarkMode ? '#3D3D3D' : '#ffffff',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#FAFAFA' : '#333333',
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? '#FAFAFA' : '#333333',
    }),
  };

  return (
    <Box>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mb: 2, fontStyle: 'italic' }}
      >
        Escolha as opções do seu personagem. Você poderá fazer mais escolhas no
        passo a passo.
      </Typography>

      {/* System & Supplements Indicator */}
      {enabledSupplements && enabledSupplements.length > 0 && (
        <Box
          sx={{
            mt: 3,
            mb: 3,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontWeight: 'medium' }}
            >
              Sistema e Suplementos Ativos:
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {enabledSupplements.map((suppId) => {
                const supplement = SUPPLEMENT_METADATA[suppId];
                return supplement ? (
                  <Chip
                    key={suppId}
                    label={supplement.name}
                    size='small'
                    color='primary'
                    variant='outlined'
                    sx={{ fontSize: '0.75rem' }}
                  />
                ) : null;
              })}
            </Stack>
          </Stack>
        </Box>
      )}

      <Grid container spacing={2}>
        {/* Race Selection - NO "Aleatoria" */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Raça <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <Select
            options={racas}
            placeholder='Selecione uma raça...'
            onChange={onSelectRaca}
            isSearchable
            styles={selectStyles}
            menuPortalTarget={document.body}
            formatOptionLabel={formatOptionLabel}
            theme={(selectTheme) => ({
              ...selectTheme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </Grid>

        {/* Class Selection - NO "Aleatoria" */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Classe <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <Select
            options={classesopt}
            placeholder='Selecione uma classe...'
            formatOptionLabel={formatOptionLabel}
            onChange={onSelectClasse}
            isSearchable
            styles={selectStyles}
            menuPortalTarget={document.body}
            theme={(selectTheme) => ({
              ...selectTheme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </Grid>

        {/* Origin Selection - NO "Aleatoria" */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Origem{' '}
            {raceHasOrigin(selectedOptions.raca) && (
              <span style={{ color: '#d32f2f' }}>*</span>
            )}
          </Typography>
          <Select
            placeholder='Selecione uma origem...'
            options={[
              { value: '__NO_ORIGIN__', label: 'Sem Origem' },
              ...origens,
            ]}
            isSearchable
            onChange={onSelectOrigin}
            isDisabled={selectedOptions.raca === 'Golem'}
            styles={selectStyles}
            menuPortalTarget={document.body}
            formatOptionLabel={formatOptionLabel}
            theme={(selectTheme) => ({
              ...selectTheme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </Grid>

        {/* Divinity Selection - NO "Aleatorio" option */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Divindade
          </Typography>
          <Select
            placeholder='Selecione...'
            options={[{ value: '--', label: 'Não devoto' }, ...divindades]}
            isSearchable
            value={selectedOptions.devocao}
            onChange={inSelectDivindade}
            styles={selectStyles}
            menuPortalTarget={document.body}
            theme={(selectTheme) => ({
              ...selectTheme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </Grid>

        {/* Level Selection */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Nível <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <CreatableSelect
            placeholder='Nível 1'
            options={niveis}
            isSearchable
            formatCreateLabel={(inputValue) => `Nível ${inputValue}`}
            onChange={onSelectNivel}
            defaultValue={{ value: '1', label: 'Nível 1' }}
            styles={selectStyles}
            menuPortalTarget={document.body}
            theme={(selectTheme) => ({
              ...selectTheme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </Grid>

        {/* Simple Sheet Checkbox */}
        <Grid
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{ display: 'flex', alignItems: 'flex-end' }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={simpleSheet}
                onChange={() => onSimpleSheetChange(!simpleSheet)}
                size={isMobile ? 'medium' : 'small'}
              />
            }
            label='Ficha simplificada'
            sx={{ fontSize: isMobile ? '16px' : '14px' }}
          />
        </Grid>
      </Grid>

      {/* Required fields note */}
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mt: 2 }}
      >
        <span style={{ color: '#d32f2f' }}>*</span> Campos obrigatorios
      </Typography>

      {/* Action Button */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant='contained'
          onClick={onCreateSheet}
          disabled={!canCreateSheet}
          size={isMobile ? 'large' : 'medium'}
          fullWidth
          startIcon={<EditIcon />}
          sx={{
            minHeight: isMobile ? '48px' : 'auto',
            fontSize: isMobile ? '16px' : '14px',
          }}
        >
          Criar Ficha
        </Button>

        {!canCreateSheet && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 1, textAlign: 'center' }}
          >
            Preencha todos os campos obrigatorios para continuar.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default NewSheetForm;
