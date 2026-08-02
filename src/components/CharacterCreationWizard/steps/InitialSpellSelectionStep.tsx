import React, { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Spell, SpellSchool } from '@/interfaces/Spells';
import { CrossTraditionRules } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { buildSpellPool } from '@/functions/spellPathUtils';
import { SupplementId } from '@/types/supplement.types';
import SpellAdvancedFilters from '@/components/SpellPicker/SpellAdvancedFilters';
import {
  SpellFilterState,
  EMPTY_SPELL_FILTERS,
  deriveSpellFilterOptions,
  applySpellFilters,
} from '@/components/SpellPicker/spellFilters';

interface InitialSpellSelectionStepProps {
  selectedSpells: Spell[];
  onChange: (spells: Spell[]) => void;
  requiredCount: number;
  className: string;
  spellType: 'Arcane' | 'Divine' | 'Both';
  schools?: SpellSchool[];
  excludeSchools?: SpellSchool[];
  includeDivineSchools?: SpellSchool[];
  includeArcaneSchools?: SpellSchool[];
  crossTraditionLimit?: number;
  crossTraditionRules?: CrossTraditionRules;
  /** Linhagem Abençoada: ao menos N das magias iniciais têm que ser divinas. */
  minCrossTraditionSpells?: number;
  supplements?: SupplementId[];
}

const InitialSpellSelectionStep: React.FC<InitialSpellSelectionStepProps> = ({
  selectedSpells,
  onChange,
  requiredCount,
  className,
  spellType,
  schools,
  excludeSchools,
  includeDivineSchools,
  includeArcaneSchools,
  crossTraditionLimit,
  crossTraditionRules,
  minCrossTraditionSpells = 0,
  supplements = [SupplementId.TORMENTA20_CORE],
}) => {
  // Get available spells based on type, schools, and supplements
  const {
    availableSpells,
    crossTraditionSpellNames,
    arcaneNames,
    divineNames,
  } = useMemo(() => {
    // Magias iniciais são sempre de 1º círculo. O pool sai do mesmo builder da
    // geração aleatória e do wizard de evolução — três implementações
    // separadas divergiam.
    const { spells, crossNames } = buildSpellPool({
      spellPath: {
        spellType,
        schools,
        excludeSchools,
        includeDivineSchools,
        includeArcaneSchools,
        crossTraditionLimit,
        crossTraditionRules,
      },
      maxCircle: 1,
      supplements,
    });

    // Tradition name sets, used by the "Tipo" filter when spellType is 'Both'.
    const spellsByCircle =
      dataRegistry.getSpellsCircle1BySupplements(supplements);
    const allArcaneNames = new Set<string>(
      (Object.values(spellsByCircle.arcane) as Spell[][])
        .flat()
        .map((s) => s.nome)
    );
    const allDivineNames = new Set<string>(
      (Object.values(spellsByCircle.divine) as Spell[][])
        .flat()
        .map((s) => s.nome)
    );

    // Sort alphabetically
    return {
      availableSpells: [...spells].sort((a, b) => a.nome.localeCompare(b.nome)),
      crossTraditionSpellNames: crossNames,
      arcaneNames: allArcaneNames,
      divineNames: allDivineNames,
    };
  }, [
    spellType,
    schools,
    excludeSchools,
    includeDivineSchools,
    includeArcaneSchools,
    crossTraditionLimit,
    crossTraditionRules,
    supplements,
  ]);

  // Count selected cross-tradition spells (all circle 1 in initial selection)
  const selectedCrossTraditionCount = useMemo(
    () =>
      selectedSpells.filter((s) => crossTraditionSpellNames.has(s.nome)).length,
    [selectedSpells, crossTraditionSpellNames]
  );

  const isCrossTraditionLimitReached =
    crossTraditionLimit !== undefined &&
    selectedCrossTraditionCount >= crossTraditionLimit;

  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const handleFilterChange = (patch: Partial<SpellFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const filterOptions = useMemo(
    () => deriveSpellFilterOptions(availableSpells),
    [availableSpells]
  );

  // All initial spells are 1st circle; tradition only makes sense when the
  // class can pick from both arcane and divine.
  const showTypeFilter = spellType === 'Both';

  const filteredSpells = useMemo(() => {
    let result = applySpellFilters(availableSpells, filters);
    if (showTypeFilter && filters.spellType !== 'all') {
      const names = filters.spellType === 'arcane' ? arcaneNames : divineNames;
      result = result.filter((spell) => names.has(spell.nome));
    }
    return result;
  }, [availableSpells, filters, showTypeFilter, arcaneNames, divineNames]);

  const handleToggle = (spell: Spell) => {
    const isSelected = selectedSpells.some((s) => s.nome === spell.nome);

    if (isSelected) {
      // Remove spell
      onChange(selectedSpells.filter((s) => s.nome !== spell.nome));
    } else if (selectedSpells.length < requiredCount) {
      // Add spell if under limit
      onChange([...selectedSpells, spell]);
    }
  };

  const isMinCrossTraditionMet =
    selectedCrossTraditionCount >= minCrossTraditionSpells;
  const isComplete =
    selectedSpells.length === requiredCount && isMinCrossTraditionMet;

  // Group spells by school for better organization
  const spellsBySchool = useMemo(() => {
    const grouped: Record<SpellSchool, Spell[]> = {
      Abjur: [],
      Adiv: [],
      Conv: [],
      Encan: [],
      Evoc: [],
      Ilusão: [],
      Necro: [],
      Trans: [],
    };

    filteredSpells.forEach((spell) => {
      if (spell.school in grouped) {
        grouped[spell.school].push(spell);
      }
    });

    // Filter out empty schools
    return Object.entries(grouped).filter(([, spells]) => spells.length > 0);
  }, [filteredSpells]);

  if (availableSpells.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity='warning'>
          Nenhuma magia disponível. Isso pode ser um erro de configuração.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
        }}
      >
        A classe {className} permite escolher {requiredCount} magia
        {requiredCount > 1 ? 's' : ''} de 1º círculo
        {schools && schools.length > 0
          ? ` das escolas: ${schools.join(', ')}`
          : ''}
        .
      </Typography>
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
        }}
      >
        Selecionadas: {selectedSpells.length} / {requiredCount}
      </Typography>
      {crossTraditionSpellNames.size > 0 && crossTraditionLimit && (
        <Alert severity='info'>
          Teurgista Místico: você pode escolher até {crossTraditionLimit} magia
          {crossTraditionLimit > 1 ? 's' : ''}{' '}
          {spellType === 'Arcane' ? 'divina' : 'arcana'}
          {crossTraditionLimit > 1 ? 's' : ''} por círculo.
          {isCrossTraditionLimitReached && ' (Limite atingido)'}
        </Alert>
      )}
      {minCrossTraditionSpells > 0 && (
        <Alert severity={isMinCrossTraditionMet ? 'success' : 'warning'}>
          Ao menos {minCrossTraditionSpells} das {requiredCount} magias precisa
          ser {spellType === 'Arcane' ? 'divina' : 'arcana'} (
          {selectedCrossTraditionCount} selecionada
          {selectedCrossTraditionCount === 1 ? '' : 's'}).
        </Alert>
      )}
      {selectedSpells.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant='subtitle2' gutterBottom>
            Magias Selecionadas:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedSpells.map((spell) => (
              <Chip
                key={spell.nome}
                label={`${spell.nome} (${spell.school})`}
                onDelete={() => handleToggle(spell)}
                color='primary'
                variant='outlined'
              />
            ))}
          </Box>
        </Paper>
      )}
      <SpellAdvancedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        options={filterOptions}
        visibleFilters={{
          school: true,
          execution: true,
          spellType: showTypeFilter,
        }}
      />
      {spellsBySchool.length === 0 && (
        <Alert severity='info'>
          Nenhuma magia encontrada com os filtros atuais.
        </Alert>
      )}
      <Box>
        {spellsBySchool.map(([school, spells]) => (
          <Accordion key={school} defaultExpanded={spellsBySchool.length <= 3}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                {school} ({spells.length} magias)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component='fieldset' fullWidth>
                <FormGroup>
                  {spells.map((spell) => {
                    const isSelected = selectedSpells.some(
                      (s) => s.nome === spell.nome
                    );
                    const isCrossTradition = crossTraditionSpellNames.has(
                      spell.nome
                    );
                    const isDisabled =
                      !isSelected &&
                      (selectedSpells.length >= requiredCount ||
                        (isCrossTradition && isCrossTraditionLimitReached));

                    return (
                      <FormControlLabel
                        key={spell.nome}
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggle(spell)}
                            disabled={isDisabled}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant='body1'>
                              {spell.nome}
                              {spell.manaExpense !== undefined && (
                                <Typography
                                  component='span'
                                  variant='body2'
                                  sx={{
                                    color: 'text.secondary',
                                    ml: 1,
                                  }}
                                >
                                  ({spell.manaExpense} PM)
                                </Typography>
                              )}
                              {isCrossTradition && (
                                <Chip
                                  label={
                                    spellType === 'Arcane' ? 'Divina' : 'Arcana'
                                  }
                                  size='small'
                                  color='secondary'
                                  variant='outlined'
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                color: 'text.secondary',
                              }}
                            >
                              {spell.description}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 2,
                          alignItems: 'flex-start',
                          ml: 0,
                          py: 1,
                          px: 1,
                          borderRadius: 1,
                          transition: 'background-color 0.2s',
                          ...(isSelected && {
                            bgcolor: 'action.selected',
                            borderLeft: 3,
                            borderColor: 'primary.main',
                          }),
                        }}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      {!isComplete && selectedSpells.length > 0 && (
        <Alert severity='warning'>
          {requiredCount - selectedSpells.length > 0
            ? `Selecione ${requiredCount - selectedSpells.length} magia${
                requiredCount - selectedSpells.length > 1 ? 's' : ''
              } adicional${
                requiredCount - selectedSpells.length > 1 ? 'is' : ''
              } para continuar.`
            : `Remova ${selectedSpells.length - requiredCount} magia${
                selectedSpells.length - requiredCount > 1 ? 's' : ''
              } para continuar.`}
        </Alert>
      )}
      {isComplete && (
        <Alert severity='success'>
          Magias selecionadas com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default InitialSpellSelectionStep;
