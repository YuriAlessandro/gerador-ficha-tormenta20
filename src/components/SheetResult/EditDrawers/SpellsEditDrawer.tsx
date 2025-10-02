import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CharacterSheet, { Step } from '@/interfaces/CharacterSheet';
import { Spell } from '@/interfaces/Spells';
import { getSpellsOfCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { getArcaneSpellsOfCircle } from '@/data/systems/tormenta20/magias/arcane';

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

const SpellsEditDrawer: React.FC<SpellsEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [selectedSpells, setSelectedSpells] = useState<Spell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCircle, setFilterCircle] = useState<number | 'all'>('all');
  const [spellType, setSpellType] = useState<'arcane' | 'divine' | 'both'>(
    'both'
  );

  useEffect(() => {
    if (sheet.spells && open) {
      setSelectedSpells([...sheet.spells]);
    }
  }, [sheet.spells, open]);

  // Get all available spells based on type and circle
  const getAllSpells = (): SpellCategory[] => {
    const categories: SpellCategory[] = [];

    for (let circle = 1; circle <= 5; circle += 1) {
      if (filterCircle !== 'all' && filterCircle !== circle) {
        // eslint-disable-next-line no-continue
        continue;
      }

      let spells: Spell[] = [];

      if (spellType === 'arcane' || spellType === 'both') {
        spells = [...spells, ...getArcaneSpellsOfCircle(circle)];
      }

      if (spellType === 'divine' || spellType === 'both') {
        spells = [...spells, ...getSpellsOfCircle(circle)];
      }

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

  const handleSpellToggle = (spell: Spell) => {
    setSelectedSpells((prev) => {
      const isSelected = prev.some((s) => s.nome === spell.nome);
      if (isSelected) {
        return prev.filter((s) => s.nome !== spell.nome);
      }
      return [...prev, spell];
    });
  };

  const isSpellSelected = (spell: Spell) =>
    selectedSpells.some((s) => s.nome === spell.nome);

  // Check if character can cast spells of this circle
  const canCastCircle = (circle: number): boolean => {
    if (!sheet.classe.spellPath) return false;

    const availableCircle = sheet.classe.spellPath.spellCircleAvailableAtLevel(
      sheet.nivel
    );
    return availableCircle >= circle;
  };

  const filterSpells = (spells: Spell[]) => {
    if (!searchTerm) return spells;
    return spells.filter(
      (spell) =>
        spell.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.school.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSave = () => {
    // Track spell changes in steps
    const originalSpellNames = sheet.spells?.map((s) => s.nome) || [];
    const newSpellNames = selectedSpells.map((s) => s.nome);

    const addedSpells = selectedSpells.filter(
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
      spells: selectedSpells,
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
    setSearchTerm('');
    setFilterCircle('all');
    setSpellType('both');
    onClose();
  };

  const spellCategories = getAllSpells();

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 800 } },
      }}
    >
      <Box sx={{ p: 3 }}>
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

        {/* Filters */}
        <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
          {/* Search Bar */}
          <TextField
            placeholder='Buscar magias...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            size='small'
            sx={{ flexGrow: 1 }}
          />

          {/* Circle Filter */}
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Círculo</InputLabel>
            <Select
              value={filterCircle}
              label='Círculo'
              onChange={(e) =>
                setFilterCircle(e.target.value as number | 'all')
              }
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value={1}>1º Círculo</MenuItem>
              <MenuItem value={2}>2º Círculo</MenuItem>
              <MenuItem value={3}>3º Círculo</MenuItem>
              <MenuItem value={4}>4º Círculo</MenuItem>
              <MenuItem value={5}>5º Círculo</MenuItem>
            </Select>
          </FormControl>

          {/* Spell Type Filter */}
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={spellType}
              label='Tipo'
              onChange={(e) =>
                setSpellType(e.target.value as 'arcane' | 'divine' | 'both')
              }
            >
              <MenuItem value='both'>Todos</MenuItem>
              <MenuItem value='arcane'>Arcanas</MenuItem>
              <MenuItem value='divine'>Divinas</MenuItem>
            </Select>
          </FormControl>
        </Stack>

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
              {selectedSpells.map((spell) => (
                <Chip
                  key={spell.nome}
                  label={`${spell.nome} (${spell.spellCircle})`}
                  size='small'
                  onDelete={() => handleSpellToggle(spell)}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
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
                      .map((spell) => (
                        <Box
                          key={spell.nome}
                          sx={{
                            p: 2,
                            border: 2,
                            borderColor: canCast
                              ? 'success.main'
                              : 'error.main',
                            borderRadius: 1,
                            backgroundColor: (() => {
                              if (isSpellSelected(spell)) {
                                return canCast
                                  ? 'success.light'
                                  : 'error.light';
                              }
                              return canCast
                                ? 'success.50'
                                : 'background.paper';
                            })(),
                            opacity: canCast ? 1 : 0.7,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSpellSelected(spell)}
                                onChange={() => handleSpellToggle(spell)}
                                size='small'
                              />
                            }
                            label={
                              <Box sx={{ width: '100%' }}>
                                <Typography
                                  variant='body1'
                                  fontWeight='bold'
                                  color={
                                    canCast ? 'text.primary' : 'error.main'
                                  }
                                >
                                  {spell.nome}
                                </Typography>
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
                      ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default SpellsEditDrawer;
