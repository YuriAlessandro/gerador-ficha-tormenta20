import React, { useMemo } from 'react';
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
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';

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
  supplements = [SupplementId.TORMENTA20_CORE],
}) => {
  // Get available spells based on type, schools, and supplements
  const { availableSpells, crossTraditionSpellNames } = useMemo(() => {
    // Get spells from registry (includes supplements)
    const spellsByCircle =
      dataRegistry.getSpellsCircle1BySupplements(supplements);
    const arcaneSpellsCircle1 = spellsByCircle.arcane;
    const divineSpellsCircle1 = spellsByCircle.divine;

    let spellList: Spell[] = [];
    const crossNames = new Set<string>();

    if (spellType === 'Arcane') {
      if (schools && schools.length > 0) {
        // Filter by schools
        spellList = schools.flatMap(
          (school) => arcaneSpellsCircle1[school] || []
        );
      } else {
        // All arcane spells of circle 1
        spellList = (Object.values(arcaneSpellsCircle1) as Spell[][]).flat();
      }

      // Include divine spells from specified schools (e.g., Necromante gets divine Necro)
      if (includeDivineSchools && includeDivineSchools.length > 0) {
        const extraDivineSpells = includeDivineSchools.flatMap(
          (school) => divineSpellsCircle1[school] || []
        );
        if (crossTraditionLimit) {
          extraDivineSpells.forEach((s) => crossNames.add(s.nome));
        }
        spellList = [...spellList, ...extraDivineSpells];
      }
    } else if (spellType === 'Divine') {
      if (schools && schools.length > 0) {
        // Divine - Filter by schools
        spellList = schools.flatMap(
          (school) => divineSpellsCircle1[school] || []
        );
      } else {
        // Divine - All schools
        spellList = (Object.values(divineSpellsCircle1) as Spell[][]).flat();
      }

      // Include arcane spells from specified schools (e.g., Teurgista Místico)
      if (includeArcaneSchools && includeArcaneSchools.length > 0) {
        const extraArcaneSpells = includeArcaneSchools.flatMap(
          (school) => arcaneSpellsCircle1[school] || []
        );
        if (crossTraditionLimit) {
          extraArcaneSpells.forEach((s) => crossNames.add(s.nome));
        }
        spellList = [...spellList, ...extraArcaneSpells];
      }
    } else if (spellType === 'Both') {
      // Both arcane and divine
      let arcaneList: Spell[] = [];
      let divineList: Spell[] = [];

      if (schools && schools.length > 0) {
        arcaneList = schools.flatMap(
          (school) => arcaneSpellsCircle1[school] || []
        );
        divineList = schools.flatMap(
          (school) => divineSpellsCircle1[school] || []
        );
      } else {
        arcaneList = (Object.values(arcaneSpellsCircle1) as Spell[][]).flat();
        divineList = (Object.values(divineSpellsCircle1) as Spell[][]).flat();
      }

      spellList = [...arcaneList, ...divineList];
    }

    // Apply excludeSchools blacklist
    if (excludeSchools && excludeSchools.length > 0) {
      spellList = spellList.filter(
        (spell) => !excludeSchools.includes(spell.school)
      );
    }

    // Remove duplicates by nome (also remove from crossNames if native version exists)
    const seenNames = new Set<string>();
    const uniqueSpells = spellList.filter((spell) => {
      if (seenNames.has(spell.nome)) return false;
      seenNames.add(spell.nome);
      return true;
    });

    // Sort alphabetically
    return {
      availableSpells: uniqueSpells.sort((a, b) =>
        a.nome.localeCompare(b.nome)
      ),
      crossTraditionSpellNames: crossNames,
    };
  }, [
    spellType,
    schools,
    excludeSchools,
    includeDivineSchools,
    includeArcaneSchools,
    crossTraditionLimit,
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

  const isComplete = selectedSpells.length === requiredCount;

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

    availableSpells.forEach((spell) => {
      if (spell.school in grouped) {
        grouped[spell.school].push(spell);
      }
    });

    // Filter out empty schools
    return Object.entries(grouped).filter(([, spells]) => spells.length > 0);
  }, [availableSpells]);

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
      <Typography variant='body1' color='text.secondary'>
        A classe {className} permite escolher {requiredCount} magia
        {requiredCount > 1 ? 's' : ''} de 1º círculo
        {schools && schools.length > 0
          ? ` das escolas: ${schools.join(', ')}`
          : ''}
        .
      </Typography>

      <Typography variant='caption' color='text.secondary'>
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
                                  color='text.secondary'
                                  sx={{ ml: 1 }}
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
                            <Typography variant='body2' color='text.secondary'>
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
