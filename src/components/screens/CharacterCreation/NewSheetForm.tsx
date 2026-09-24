import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import Select, { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import SelectOptions from '../../../interfaces/SelectedOptions';
import { SupplementId } from '../../../types/supplement.types';
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
import { useOptionalRulesAvailable } from '../../../hooks/useOptionalRules';
import {
  useDualDevotionAvailable,
  useSincretismos,
} from '../../../hooks/useDualDevotion';
import { normalizeDeityName } from '../../../functions/deityName';

type SelectedOption = {
  value: string;
  label: string;
  supplementId?: SupplementId;
  supplementName?: string;
  isVariant?: boolean;
  /** Status divino (1-5) — presente apenas nas divindades menores. */
  statusDivino?: number;
};

interface NewSheetFormProps {
  isDarkMode: boolean;
  selectedOptions: SelectOptions;
  onSelectedOptionsChange: (options: SelectOptions) => void;
  onCreateSheet: () => void;
  userSupplements: SupplementId[];
  /**
   * Props de suplementos mantidas por compatibilidade. A UI de suplementos agora
   * vive no ActiveContentBar, então estas são opcionais e não são renderizadas.
   */
  /* eslint-disable react/no-unused-prop-types */
  isAuthenticated?: boolean;
  onConfigureSupplements?: () => void;
  /* eslint-enable react/no-unused-prop-types */
}

// Deuses maiores primeiro, depois os de suplemento — cada grupo em ordem
// alfabética. Ordenar a lista inteira junta misturaria os dois.
const byLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label, 'pt-BR');

const formatOptionLabel = (option: SelectedOption) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span>{option.label}</span>
    {option.statusDivino !== undefined && (
      <Chip
        label={`Deus menor · Status ${option.statusDivino}`}
        size='small'
        sx={{
          height: '20px',
          fontSize: '0.75rem',
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText',
        }}
      />
    )}
    {option.isVariant && (
      <Chip
        label='Variante'
        size='small'
        sx={{
          height: '20px',
          fontSize: '0.75rem',
          backgroundColor: 'info.main',
          color: 'info.contrastText',
        }}
      />
    )}
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
  onCreateSheet,
  userSupplements,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const optionalRulesAvailable = useOptionalRulesAvailable();
  const dualDevotionAvailable = useDualDevotionAvailable();
  const sincretismos = useSincretismos();

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
    const raceName = raca?.value ?? '';
    const hasOrigin = raceHasOrigin(raceName);

    let newOrigin = '__NO_ORIGIN__';
    if (hasOrigin) {
      newOrigin =
        selectedOptions.origin === '__NO_ORIGIN__'
          ? ''
          : selectedOptions.origin;
    }

    onSelectedOptionsChange({
      ...selectedOptions,
      raca: raceName,
      origin: newOrigin,
    });
  };

  const onSelectClasse = (classe: SelectedOption | null) => {
    onSelectedOptionsChange({
      ...selectedOptions,
      classe: classe?.value ?? '',
      devocao: { label: 'Não devoto', value: '--' },
      // A devoção é resetada porque a lista de deuses permitidos depende da
      // classe; a segunda divindade e o sincretismo têm que ir junto, senão
      // sobra um par órfão apontando para um deus que a classe nova não serve.
      devocaoSecundaria: undefined,
      sincretismo: undefined,
    });
  };

  const onSelectOrigin = (origin: SelectedOption | null) => {
    onSelectedOptionsChange({
      ...selectedOptions,
      origin: origin?.value ?? '',
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

  const classesopt = React.useMemo<SelectedOption[]>(() => {
    const baseClasses = CLASSES.filter((c) => !c.isVariant);
    const variants = CLASSES.filter((c) => c.isVariant);
    const options: SelectedOption[] = [];

    baseClasses.forEach((classe: ClassWithSupplement) => {
      options.push({
        value: classe.name,
        label: classe.name,
        supplementId: classe.supplementId,
        supplementName: classe.supplementName,
      });
      variants
        .filter((v) => v.baseClassName === classe.name)
        .forEach((variant: ClassWithSupplement) => {
          options.push({
            value: variant.name,
            label: `  ↳ ${variant.name}`,
            supplementId: variant.supplementId,
            supplementName: variant.supplementName,
            isVariant: true,
          });
        });
    });

    return options;
  }, [CLASSES]);

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
  const divindades = React.useMemo(() => {
    const staticOptions = allDivindadeNames
      .filter((dv) => {
        // Devoções Abertas (Heróis de Arton): o Panteão aceita qualquer devoto,
        // então as restrições de classe caem.
        if (selectedOptions.openDeities) return true;
        if (selectedOptions.classe) {
          const classe = CLASSES.find((c) => c.name === selectedOptions.classe);
          if (classe) return classe?.faithProbability?.[dv] !== 0;
          return true;
        }
        return true;
      })
      .map((sdv) => ({
        value: sdv as string,
        label: divindadeDisplayNames[sdv],
      }));
    // Divindades vindas de suplementos ativos (ex.: Guia de Deuses Menores) e
    // de homebrew — o `value` é o NOME, pois não há chave no enum estático.
    const supplementOptions = dataRegistry
      .getSupplementDeities(userSupplements)
      .map((d) => ({
        value: d.name,
        label: d.name,
        statusDivino: d.statusDivino,
      }));
    return [...staticOptions.sort(byLabel), ...supplementOptions.sort(byLabel)];
  }, [
    selectedOptions.classe,
    selectedOptions.openDeities,
    CLASSES,
    userSupplements,
  ]);

  /**
   * Sincretismo do catálogo que corresponde a um par de opções de divindade.
   * O par é NÃO-ORDENADO, e a comparação passa por `normalizeDeityName` porque
   * as opções carregam a chave do enum (`TANNATOH`) enquanto o sincretismo
   * carrega o nome formatado (`Tanna-Toh`).
   */
  /** Só faz sentido oferecer devoção dupla se já houver uma devoção. */
  const isDevoto =
    !!selectedOptions.devocao?.value && selectedOptions.devocao.value !== '--';

  /**
   * A regra exige estar na lista de devotos permitidos dos DOIS deuses, então
   * a segunda lista sai da mesma lista filtrada por classe — só sem o deus já
   * escolhido como primário.
   */
  const divindadesSecundarias = React.useMemo(
    () =>
      divindades.filter(
        (option) => option.value !== selectedOptions.devocao?.value
      ),
    [divindades, selectedOptions.devocao]
  );

  const sincretismoOptions = React.useMemo(
    () => sincretismos.map((s) => ({ value: s.name, label: s.name })),
    [sincretismos]
  );

  const sincretismoAtual = React.useMemo(
    () =>
      sincretismos.find((s) => s.name === selectedOptions.sincretismo?.value),
    [sincretismos, selectedOptions.sincretismo]
  );

  const findSincretismo = React.useCallback(
    (a?: string, b?: string) => {
      if (!a || !b) return undefined;
      const [na, nb] = [normalizeDeityName(a), normalizeDeityName(b)];
      return sincretismos.find((sincretismo) => {
        const [d1, d2] = sincretismo.deities.map(normalizeDeityName);
        return (d1 === na && d2 === nb) || (d1 === nb && d2 === na);
      });
    },
    [sincretismos]
  );

  /** Opção de divindade equivalente a um nome vindo de um sincretismo. */
  const deityOptionFor = React.useCallback(
    (name: string) => {
      const normalized = normalizeDeityName(name);
      return (
        divindades.find(
          (option) =>
            normalizeDeityName(option.value) === normalized ||
            normalizeDeityName(option.label) === normalized
        ) ?? { value: name, label: name }
      );
    },
    [divindades]
  );

  const inSelectDivindade = (divindade: SelectedOption | null) => {
    const devocao = divindade ?? { label: 'Não devoto', value: '--' };
    const sincretismo = findSincretismo(
      devocao.value,
      selectedOptions.devocaoSecundaria?.value
    );
    onSelectedOptionsChange({
      ...selectedOptions,
      devocao,
      // Re-resolve o sincretismo pelo par. Não achar é um estado VÁLIDO — a
      // regra permite um par criado pelo mestre e pelo jogador.
      sincretismo: sincretismo
        ? { value: sincretismo.name, label: sincretismo.name }
        : undefined,
    });
  };

  const inSelectDivindadeSecundaria = (divindade: SelectedOption | null) => {
    const sincretismo = findSincretismo(
      selectedOptions.devocao?.value,
      divindade?.value
    );
    onSelectedOptionsChange({
      ...selectedOptions,
      devocaoSecundaria: divindade ?? undefined,
      sincretismo: sincretismo
        ? { value: sincretismo.name, label: sincretismo.name }
        : undefined,
    });
  };

  /** Escolher o sincretismo preenche as DUAS divindades — o outro sentido. */
  const inSelectSincretismo = (option: SelectedOption | null) => {
    if (!option) {
      onSelectedOptionsChange({ ...selectedOptions, sincretismo: undefined });
      return;
    }
    const sincretismo = sincretismos.find((s) => s.name === option.value);
    if (!sincretismo) return;
    onSelectedOptionsChange({
      ...selectedOptions,
      sincretismo: option,
      devocao: deityOptionFor(sincretismo.deities[0]),
      devocaoSecundaria: deityOptionFor(sincretismo.deities[1]),
    });
  };

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
        sx={{
          color: 'text.secondary',
          mb: 2.5,
          fontStyle: 'italic',
        }}
      >
        Escolha as opções do seu personagem. Você poderá fazer mais escolhas no
        passo a passo.
      </Typography>
      <Grid container spacing={2}>
        {/* Race Selection - NO "Aleatoria" */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
            Raça <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <Select
            options={racas}
            placeholder='Selecione uma raça...'
            value={racas.find((r) => r.value === selectedOptions.raca) ?? null}
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
            value={
              classesopt.find((c) => c.value === selectedOptions.classe) ?? null
            }
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
            value={
              selectedOptions.origin
                ? [
                    { value: '__NO_ORIGIN__', label: 'Sem Origem' },
                    ...origens,
                  ].find((o) => o.value === selectedOptions.origin) || null
                : null
            }
            isSearchable
            onChange={onSelectOrigin}
            isDisabled={!raceHasOrigin(selectedOptions.raca)}
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
            formatOptionLabel={formatOptionLabel}
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
          {optionalRulesAvailable && (
            <FormControlLabel
              sx={{ mt: 0.5, ml: 0 }}
              control={
                <Switch
                  size='small'
                  checked={!!selectedOptions.openDeities}
                  onChange={(_e, checked) =>
                    onSelectedOptionsChange({
                      ...selectedOptions,
                      openDeities: checked,
                    })
                  }
                />
              }
              label={
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Devoções Abertas{' '}
                  <Tooltip title='Regra opcional de Heróis de Arton (p. 281): um personagem pode ser devoto de qualquer divindade, independente de sua raça ou classe.'>
                    <HelpOutlineIcon
                      fontSize='inherit'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  </Tooltip>
                </Typography>
              }
            />
          )}
          {dualDevotionAvailable && isDevoto && (
            <FormControlLabel
              sx={{ mt: 0.5, ml: 0 }}
              control={
                <Switch
                  size='small'
                  checked={!!selectedOptions.dualDevotion}
                  onChange={(_e, checked) =>
                    onSelectedOptionsChange({
                      ...selectedOptions,
                      dualDevotion: checked,
                      // Desligar a regra não pode deixar o par para trás.
                      ...(checked
                        ? {}
                        : {
                            devocaoSecundaria: undefined,
                            sincretismo: undefined,
                          }),
                    })
                  }
                />
              }
              label={
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Devoção Dupla{' '}
                  <Tooltip title='Regra opcional de Sincretismos de Arton: o personagem conta como devoto de dois deuses maiores. Ele NÃO ganha poderes concedidos adicionais — escolhe os que já teria das listas dos dois deuses, mais o poder único do sincretismo. Precisa seguir as obrigações e restrições de ambos, e estar na lista de devotos permitidos dos dois. Não é possível ser devoto duplo e fundamentalista ao mesmo tempo.'>
                    <HelpOutlineIcon
                      fontSize='inherit'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  </Tooltip>
                </Typography>
              }
            />
          )}
        </Grid>

        {/* Devoção Dupla: segunda divindade + sincretismo (bidirecionais) */}
        {dualDevotionAvailable && isDevoto && selectedOptions.dualDevotion && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Segunda divindade
              </Typography>
              <Select
                placeholder='Selecione...'
                options={divindadesSecundarias}
                formatOptionLabel={formatOptionLabel}
                isSearchable
                isClearable
                value={selectedOptions.devocaoSecundaria ?? null}
                onChange={inSelectDivindadeSecundaria}
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: { ...formThemeColors },
                })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                Sincretismo
              </Typography>
              <Select
                placeholder='Sincretismo próprio'
                options={sincretismoOptions}
                isSearchable
                isClearable
                value={selectedOptions.sincretismo ?? null}
                onChange={inSelectSincretismo}
                styles={selectStyles}
                menuPortalTarget={document.body}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: { ...formThemeColors },
                })}
              />
              {!sincretismoAtual && (
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                >
                  Nenhum sincretismo do livro cobre esse par — vale como um
                  criado pelo mestre e pelo jogador.
                </Typography>
              )}
            </Grid>
          </>
        )}

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
            // Controlado (e não `defaultValue`): o formulário é remontado pelo
            // `key={mode}` do layout e `selectedOptions` não é resetado — sem
            // isso o campo volta a exibir "Nível 1" com o valor antigo no estado
            value={
              niveis.find((n) => Number(n.value) === selectedOptions.nivel) ?? {
                value: String(selectedOptions.nivel),
                label: `Nível ${selectedOptions.nivel}`,
              }
            }
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
      </Grid>
      {/* Required fields note */}
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
          display: 'block',
          mt: 2,
        }}
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
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 1,
              textAlign: 'center',
            }}
          >
            Preencha todos os campos obrigatorios para continuar.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default NewSheetForm;
