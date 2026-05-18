import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  TextField,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CharacterSheet, { Step } from '@/interfaces/CharacterSheet';
import { Spell } from '@/interfaces/Spells';
import { getSpellsOfCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { getArcaneSpellsOfCircle } from '@/data/systems/tormenta20/magias/arcane';
import { SupplementId, SUPPLEMENT_METADATA } from '@/types/supplement.types';
import { TORMENTA20_SYSTEM } from '@/data/systems/tormenta20';
import SpellAdvancedFilters from '@/components/SpellPicker/SpellAdvancedFilters';
import {
  SpellFilterState,
  EMPTY_SPELL_FILTERS,
  getCircleNumber,
  deriveSpellFilterOptions,
  applySpellFilters,
} from '@/components/SpellPicker/spellFilters';
import CustomSpellDialog from './CustomSpellDialog';

interface SpellsEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

interface SpellCategory {
  name: string;
  spells: Spell[];
  circle: number;
}

interface SpellWithSupplement {
  spell: Spell;
  supplementId: SupplementId;
}

const SpellsEditDrawer: React.FC<SpellsEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  // Use all available supplements for spell editing (not just user's enabled ones)
  const allSupplements = useMemo(
    () => Object.keys(TORMENTA20_SYSTEM.supplements) as SupplementId[],
    []
  );

  const [selectedSpells, setSelectedSpells] = useState<Spell[]>([]);
  const [bonusSpellDC, setBonusSpellDC] = useState<number>(
    sheet.bonusSpellDC ?? 0
  );
  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const handleFilterChange = (patch: Partial<SpellFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));
  // The spell sourcing helpers below work with 'both' instead of 'all'.
  const sourceSpellType: 'arcane' | 'divine' | 'both' =
    filters.spellType === 'all' ? 'both' : filters.spellType;
  const [customSpellDialog, setCustomSpellDialog] = useState<{
    open: boolean;
    spellToEdit?: Spell;
  }>({ open: false });

  useEffect(() => {
    if (sheet.spells && open) {
      setSelectedSpells([...sheet.spells]);
    }
  }, [sheet.spells, open]);

  // Get spells from active supplements
  const getSupplementSpells = useMemo(() => {
    const spells: SpellWithSupplement[] = [];

    allSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.spells) {
        // For arcane or both types
        if (sourceSpellType === 'arcane' || sourceSpellType === 'both') {
          supplement.spells.arcane?.forEach((spell) => {
            spells.push({ spell, supplementId });
          });
          // Universal spells appear in arcane list
          supplement.spells.universal?.forEach((spell) => {
            spells.push({ spell, supplementId });
          });
        }

        // For divine or both types
        if (sourceSpellType === 'divine' || sourceSpellType === 'both') {
          supplement.spells.divine?.forEach((spell) => {
            spells.push({ spell, supplementId });
          });
          // Universal spells appear in divine list (only add if not 'both' to avoid duplicates)
          if (sourceSpellType === 'divine') {
            supplement.spells.universal?.forEach((spell) => {
              spells.push({ spell, supplementId });
            });
          }
        }
      }
    });

    return spells;
  }, [allSupplements, sourceSpellType]);

  // Get all available spells based on type and circle
  const getAllSpells = (): SpellCategory[] => {
    const categories: SpellCategory[] = [];

    for (let circle = 1; circle <= 5; circle += 1) {
      if (filters.circle !== 'all' && filters.circle !== circle) {
        // eslint-disable-next-line no-continue
        continue;
      }

      let spells: Spell[] = [];

      if (sourceSpellType === 'arcane' || sourceSpellType === 'both') {
        spells = [...spells, ...getArcaneSpellsOfCircle(circle)];
      }

      if (sourceSpellType === 'divine' || sourceSpellType === 'both') {
        spells = [...spells, ...getSpellsOfCircle(circle)];
      }

      // Add supplement spells for this circle
      const supplementSpellsForCircle = getSupplementSpells.filter(
        ({ spell }) => getCircleNumber(spell.spellCircle) === circle
      );

      spells = [...spells, ...supplementSpellsForCircle.map((s) => s.spell)];

      // Remove duplicates (some spells might be in both arcane and divine)
      const uniqueSpells = spells.filter(
        (spell, index, self) =>
          index === self.findIndex((s) => s.nome === spell.nome)
      );

      if (uniqueSpells.length > 0) {
        categories.push({
          name: `${circle}º Círculo`,
          spells: uniqueSpells,
          circle,
        });
      }
    }

    return categories;
  };

  // Magia da Sapiência (Moreau Coruja) é fixa: não pode ser removida pelo usuário.
  const isMoreauSapienciaSpell = (spell: Spell): boolean =>
    !!sheet.moreauSapienciaSpell && spell.nome === sheet.moreauSapienciaSpell;

  const handleSpellToggle = (spell: Spell) => {
    if (isMoreauSapienciaSpell(spell)) return;
    setSelectedSpells((prev) => {
      const existingSpell = prev.find((s) => s.nome === spell.nome);
      if (existingSpell) {
        // Remove spell
        return prev.filter((s) => s.nome !== spell.nome);
      }
      // Add spell - check if it was previously in the sheet with custom data
      const originalSpell = sheet.spells?.find((s) => s.nome === spell.nome);
      if (originalSpell) {
        // Preserve existing rolls, memorized, and alwaysPrepared
        return [
          ...prev,
          {
            ...spell,
            rolls: originalSpell.rolls,
            memorized: originalSpell.memorized,
            alwaysPrepared: originalSpell.alwaysPrepared,
          },
        ];
      }
      // Add new spell
      return [...prev, spell];
    });
  };

  const isSpellSelected = (spell: Spell) =>
    selectedSpells.some((s) => s.nome === spell.nome);

  // Check if character can cast spells of this circle
  const canCastCircle = (circle: number): boolean => {
    if (!sheet.classe.spellPath) return false;
    if (
      typeof sheet.classe.spellPath.spellCircleAvailableAtLevel !== 'function'
    )
      return false;

    const availableCircle = sheet.classe.spellPath.spellCircleAvailableAtLevel(
      sheet.nivel
    );
    return availableCircle >= circle;
  };

  // Stable filter options derived from the full spell catalog (all
  // circles/types + supplements), so dropdown choices don't disappear as
  // the user narrows the selection.
  const filterOptions = useMemo(() => {
    const all: Spell[] = [];
    for (let circle = 1; circle <= 5; circle += 1) {
      all.push(...getArcaneSpellsOfCircle(circle));
      all.push(...getSpellsOfCircle(circle));
    }
    allSupplements.forEach((supplementId) => {
      const supplementSpells =
        TORMENTA20_SYSTEM.supplements[supplementId]?.spells;
      if (supplementSpells) {
        supplementSpells.arcane?.forEach((spell) => all.push(spell));
        supplementSpells.divine?.forEach((spell) => all.push(spell));
        supplementSpells.universal?.forEach((spell) => all.push(spell));
      }
    });
    return deriveSpellFilterOptions(all);
  }, [allSupplements]);

  // Circle/spellType are already applied at the data source (getAllSpells),
  // so only search/school/execution remain to be applied per category.
  const filterSpells = (spells: Spell[]) => applySpellFilters(spells, filters);

  // Custom spell handlers
  const handleSaveCustomSpell = (spell: Spell) => {
    if (customSpellDialog.spellToEdit) {
      // Edit existing
      setSelectedSpells((prev) =>
        prev.map((s) =>
          s.nome === customSpellDialog.spellToEdit?.nome ? spell : s
        )
      );
    } else {
      // Add new
      setSelectedSpells((prev) => [...prev, spell]);
    }
    setCustomSpellDialog({ open: false });
  };

  const handleRemoveCustomSpell = (spellName: string) => {
    setSelectedSpells((prev) => prev.filter((s) => s.nome !== spellName));
  };

  const existingSpellNames = useMemo(
    () => selectedSpells.map((s) => s.nome),
    [selectedSpells]
  );

  const customSpellsSelected = selectedSpells.filter((s) => s.isCustom);

  const handleSave = () => {
    // Defesa em profundidade: se a magia da Sapiência (Moreau Coruja) tiver
    // sido removida da seleção, recuperá-la a partir da ficha original. Ela é
    // re-aplicada pelo recalculate, mas evitamos sair do drawer com a lista
    // visualmente inconsistente até lá.
    let finalSelectedSpells = selectedSpells;
    if (sheet.moreauSapienciaSpell) {
      const stillIncluded = selectedSpells.some(
        (s) => s.nome === sheet.moreauSapienciaSpell
      );
      if (!stillIncluded) {
        const originalSapienciaSpell = sheet.spells?.find(
          (s) => s.nome === sheet.moreauSapienciaSpell
        );
        if (originalSapienciaSpell) {
          finalSelectedSpells = [...selectedSpells, originalSapienciaSpell];
        }
      }
    }

    // Track spell changes in steps
    const originalSpellNames = sheet.spells?.map((s) => s.nome) || [];
    const newSpellNames = finalSelectedSpells.map((s) => s.nome);

    const addedSpells = finalSelectedSpells.filter(
      (s) => !originalSpellNames.includes(s.nome)
    );
    const removedSpells =
      sheet.spells?.filter((s) => !newSpellNames.includes(s.nome)) || [];

    const newSteps: Step[] = [];

    if (addedSpells.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Magias Adicionadas',
        type: 'Magias',
        value: addedSpells.map((s) => ({
          name: s.nome,
          value: `${s.nome} (${s.spellCircle}º círculo)`,
        })),
      });
    }

    if (removedSpells.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Magias Removidas',
        type: 'Magias',
        value: removedSpells.map((s) => ({
          name: s.nome,
          value: `${s.nome} (${s.spellCircle}º círculo) - removida`,
        })),
      });
    }

    const updates: Partial<CharacterSheet> = {
      spells: finalSelectedSpells,
      bonusSpellDC: bonusSpellDC || undefined,
    };

    if (newSteps.length > 0) {
      updates.steps = [...sheet.steps, ...newSteps];
    }

    onSave(updates);
    onClose();
  };

  const handleCancel = () => {
    if (sheet.spells) {
      setSelectedSpells([...sheet.spells]);
    }
    setBonusSpellDC(sheet.bonusSpellDC ?? 0);
    setFilters(EMPTY_SPELL_FILTERS);
    onClose();
  };

  const spellCategories = getAllSpells();

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 800 }, overflow: 'hidden' },
      }}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Magias</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Selecione as magias do personagem. Magias que atendem aos
          pré-requisitos do seu nível são destacadas em verde.
        </Typography>

        {/* Bonus Spell DC */}
        <TextField
          label='Bônus no Teste de Resistência'
          type='number'
          value={bonusSpellDC}
          onChange={(e) => setBonusSpellDC(parseInt(e.target.value, 10) || 0)}
          helperText='Bônus adicional na CD de magias de fontes não automáticas'
          inputProps={{ min: -50, max: 50 }}
          size='small'
          sx={{ mb: 3, maxWidth: 300 }}
        />

        {/* Filters */}
        <SpellAdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          options={filterOptions}
          visibleFilters={{
            circle: true,
            school: true,
            execution: true,
            spellType: true,
          }}
        />

        {/* Custom Spell Button */}
        <Button
          variant='outlined'
          color='success'
          startIcon={<AddIcon />}
          onClick={() => setCustomSpellDialog({ open: true })}
          size='small'
          sx={{ mb: 2, alignSelf: 'flex-start' }}
        >
          Adicionar Magia Personalizada
        </Button>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {/* Custom Spells Section */}
          {customSpellsSelected.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: 2,
                borderColor: 'success.main',
                backgroundColor: 'success.50',
                borderRadius: 1,
              }}
            >
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Magias Personalizadas ({customSpellsSelected.length}):
              </Typography>
              <Stack spacing={1}>
                {customSpellsSelected.map((spell) => (
                  <Stack
                    key={spell.nome}
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    <Box>
                      <Typography variant='body2' fontWeight='bold'>
                        {spell.nome}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {spell.school} • {spell.spellCircle} • {spell.execucao}
                      </Typography>
                    </Box>
                    <Stack direction='row' spacing={0.5}>
                      <IconButton
                        size='small'
                        onClick={() =>
                          setCustomSpellDialog({
                            open: true,
                            spellToEdit: spell,
                          })
                        }
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleRemoveCustomSpell(spell.nome)}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Selected Spells Summary */}
          {selectedSpells.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Magias Selecionadas ({selectedSpells.length}):
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap'>
                {selectedSpells
                  .filter((s) => !s.isCustom)
                  .map((spell) => {
                    const locked = isMoreauSapienciaSpell(spell);
                    const chip = (
                      <Chip
                        key={spell.nome}
                        label={`${spell.nome} (${spell.spellCircle})`}
                        size='small'
                        color={locked ? 'primary' : 'default'}
                        onDelete={
                          locked ? undefined : () => handleSpellToggle(spell)
                        }
                      />
                    );
                    return locked ? (
                      <Tooltip
                        key={spell.nome}
                        title='Magia fixa da habilidade Sapiência. Para trocar, edite a customização do Moreau.'
                      >
                        <span>{chip}</span>
                      </Tooltip>
                    ) : (
                      chip
                    );
                  })}
                {selectedSpells
                  .filter((s) => s.isCustom)
                  .map((spell) => (
                    <Chip
                      key={spell.nome}
                      label={`${spell.nome} (${spell.spellCircle})`}
                      size='small'
                      color='success'
                      onDelete={() => handleRemoveCustomSpell(spell.nome)}
                    />
                  ))}
              </Stack>
            </Box>
          )}

          <Box>
            {spellCategories.map((category) => {
              const filteredSpells = filterSpells(category.spells);

              if (filteredSpells.length === 0) return null;

              const canCast = canCastCircle(category.circle);

              return (
                <Accordion key={category.name}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant='h6' color='text.primary'>
                      {category.name} ({filteredSpells.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {filteredSpells
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((spell) => {
                          // Find if this spell is from a supplement
                          const supplementSpell = getSupplementSpells.find(
                            (s) => s.spell.nome === spell.nome
                          );

                          return (
                            <Box
                              key={spell.nome}
                              sx={{
                                p: 2,
                                border: 2,
                                borderColor: (() => {
                                  if (isSpellSelected(spell))
                                    return 'primary.main';
                                  if (canCast) return 'success.main';
                                  return 'grey.400';
                                })(),
                                borderRadius: 1,
                                backgroundColor: isSpellSelected(spell)
                                  ? 'primary.50'
                                  : 'background.paper',
                                opacity: canCast ? 1 : 0.6,
                                '&:hover': {
                                  backgroundColor: isSpellSelected(spell)
                                    ? 'primary.100'
                                    : 'action.hover',
                                },
                              }}
                            >
                              <FormControlLabel
                                disabled={isMoreauSapienciaSpell(spell)}
                                control={
                                  <Tooltip
                                    title={
                                      isMoreauSapienciaSpell(spell)
                                        ? 'Magia fixa da habilidade Sapiência. Para trocar, edite a customização do Moreau.'
                                        : ''
                                    }
                                  >
                                    <span>
                                      <Checkbox
                                        checked={isSpellSelected(spell)}
                                        onChange={() =>
                                          handleSpellToggle(spell)
                                        }
                                        size='small'
                                        disabled={isMoreauSapienciaSpell(spell)}
                                      />
                                    </span>
                                  </Tooltip>
                                }
                                label={
                                  <Box sx={{ width: '100%' }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        variant='body1'
                                        fontWeight='bold'
                                        color={
                                          isSpellSelected(spell)
                                            ? 'primary.main'
                                            : 'text.primary'
                                        }
                                      >
                                        {spell.nome}
                                      </Typography>
                                      {supplementSpell &&
                                        supplementSpell.supplementId !==
                                          SupplementId.TORMENTA20_CORE && (
                                          <Chip
                                            label={
                                              SUPPLEMENT_METADATA[
                                                supplementSpell.supplementId
                                              ]?.abbreviation || ''
                                            }
                                            size='small'
                                            color='primary'
                                            variant='outlined'
                                          />
                                        )}
                                    </Box>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                      sx={{ display: 'block', mb: 1 }}
                                    >
                                      {spell.school} • {spell.execucao} •{' '}
                                      {spell.alcance} • {spell.duracao}
                                      {spell.manaExpense &&
                                        ` • ${spell.manaExpense} PM`}
                                    </Typography>
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                    >
                                      {spell.description}
                                    </Typography>
                                  </Box>
                                }
                                sx={{ alignItems: 'flex-start', width: '100%' }}
                              />
                            </Box>
                          );
                        })}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>

        <Stack direction='row' spacing={2} sx={{ mt: 3, flexShrink: 0 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
      <CustomSpellDialog
        open={customSpellDialog.open}
        onClose={() => setCustomSpellDialog({ open: false })}
        onSave={handleSaveCustomSpell}
        spell={customSpellDialog.spellToEdit}
        existingSpellNames={existingSpellNames}
      />
    </Drawer>
  );
};

export default SpellsEditDrawer;
