import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CompanionSheet, CompanionTrick } from '@/interfaces/Companion';
import { Spell } from '@/interfaces/Spells';
import { getAvailableTricks } from '@/data/systems/tormenta20/herois-de-arton/companion';
import { CompanionTrickDefinition } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { allArcaneSpellsCircle1 } from '@/data/systems/tormenta20/magias/arcane';
import { allDivineSpellsCircle1 } from '@/data/systems/tormenta20/magias/divine';

const COMPANION_ATTRIBUTE_OPTIONS = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

interface CompanionTrickSelectionStepProps {
  companion: CompanionSheet;
  trainerLevel: number;
  selectedTrick?: CompanionTrick;
  onSelectTrick: (trick: CompanionTrick | undefined) => void;
  // Múltiplos companheiros (Conquistar pelos Números)
  companions?: CompanionSheet[];
  selectedCompanionIndex?: number;
  onSelectCompanion?: (companionIndex: number) => void;
  // Sub-escolha de magia (truque "Magia Inata")
  selectedSpell?: Spell;
  onSelectSpell?: (spell: Spell | undefined) => void;
}

const CompanionTrickSelectionStep: React.FC<
  CompanionTrickSelectionStepProps
> = ({
  companion,
  trainerLevel,
  selectedTrick,
  onSelectTrick,
  companions,
  selectedCompanionIndex,
  onSelectCompanion,
  selectedSpell,
  onSelectSpell,
}) => {
  const naturalWeaponCount = companion.naturalWeapons.length;
  const [spellSearch, setSpellSearch] = useState('');

  const availableTricks: CompanionTrickDefinition[] = useMemo(
    () =>
      getAvailableTricks(
        trainerLevel,
        companion.companionType,
        companion.size,
        companion.tricks,
        naturalWeaponCount,
        false
      ),
    [
      trainerLevel,
      companion.companionType,
      companion.size,
      companion.tricks,
      naturalWeaponCount,
    ]
  );

  // Combina arcanas + divinas de 1º círculo, removendo duplicatas (mesmo nome)
  const innateSpellOptions: Spell[] = useMemo(() => {
    const byName = new Map<string, Spell>();
    [...allArcaneSpellsCircle1, ...allDivineSpellsCircle1].forEach((spell) => {
      if (!byName.has(spell.nome)) byName.set(spell.nome, spell);
    });
    return Array.from(byName.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }, []);

  const filteredInnateSpells = useMemo(() => {
    if (!spellSearch) return innateSpellOptions;
    const q = spellSearch.toLowerCase();
    return innateSpellOptions.filter(
      (s) =>
        s.nome.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [innateSpellOptions, spellSearch]);

  const handleToggleTrick = (trick: CompanionTrickDefinition) => {
    if (selectedTrick?.name === trick.name) {
      onSelectTrick(undefined);
      if (onSelectSpell) onSelectSpell(undefined);
    } else {
      onSelectTrick({ name: trick.name });
      if (onSelectSpell) onSelectSpell(undefined);
    }
  };

  const handleChoiceChange = (choiceKey: string, value: string) => {
    if (selectedTrick) {
      onSelectTrick({
        ...selectedTrick,
        choices: { ...selectedTrick.choices, [choiceKey]: value },
      });
    }
  };

  const handleSelectSpell = (spell: Spell) => {
    if (!onSelectSpell) return;
    if (selectedSpell?.nome === spell.nome) {
      onSelectSpell(undefined);
      if (selectedTrick) {
        const newChoices = { ...selectedTrick.choices };
        delete newChoices.spell;
        onSelectTrick({ ...selectedTrick, choices: newChoices });
      }
    } else {
      onSelectSpell(spell);
      if (selectedTrick) {
        onSelectTrick({
          ...selectedTrick,
          choices: { ...selectedTrick.choices, spell: spell.nome },
        });
      }
    }
  };

  const companionName = companion.name || 'Melhor Amigo';
  const showCompanionSelector =
    !!companions &&
    companions.length > 1 &&
    typeof selectedCompanionIndex === 'number' &&
    !!onSelectCompanion;

  const isSelectionComplete = useMemo(() => {
    if (!selectedTrick) return false;
    const def = availableTricks.find((t) => t.name === selectedTrick.name);
    if (!def?.hasSubChoice) return true;
    if (def.subChoiceType === 'attribute')
      return (
        !!selectedTrick.choices?.primary && !!selectedTrick.choices?.secondary
      );
    if (def.subChoiceType === 'movement') return !!selectedTrick.choices?.type;
    if (def.subChoiceType === 'spell') return !!selectedSpell;
    return true;
  }, [selectedTrick, availableTricks, selectedSpell]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {showCompanionSelector && (
        <FormControl
          size='small'
          sx={{ minWidth: 240, alignSelf: 'flex-start' }}
        >
          <InputLabel>Melhor Amigo</InputLabel>
          <Select
            label='Melhor Amigo'
            value={selectedCompanionIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (onSelectCompanion) onSelectCompanion(idx);
              // Reset sub-escolhas ao trocar de companheiro
              onSelectTrick(undefined);
              if (onSelectSpell) onSelectSpell(undefined);
            }}
          >
            {companions?.map((c, idx) => (
              <MenuItem
                // eslint-disable-next-line react/no-array-index-key
                key={`${c.name || 'companion'}-${c.companionType}-${idx}`}
                value={idx}
              >
                {c.name || `Amigo ${idx + 1}`} ({c.companionType} {c.size})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Typography variant='body1' color='text.secondary'>
        Escolha um novo truque para {companionName} ({companion.companionType}{' '}
        {companion.size}):
      </Typography>

      {availableTricks.length > 0 ? (
        <Box>
          {availableTricks.map((trick) => {
            const isSelected = selectedTrick?.name === trick.name;
            return (
              <Box key={trick.name} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleTrick(trick)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='subtitle1'>{trick.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {trick.text}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
                {isSelected &&
                  trick.hasSubChoice &&
                  trick.subChoiceType === 'attribute' && (
                    <Box
                      sx={{
                        ml: 4,
                        mt: 1,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <FormControl size='small' sx={{ minWidth: 160 }}>
                        <InputLabel>Primário (+2)</InputLabel>
                        <Select
                          label='Primário (+2)'
                          value={selectedTrick?.choices?.primary || ''}
                          onChange={(e) =>
                            handleChoiceChange('primary', e.target.value)
                          }
                        >
                          {COMPANION_ATTRIBUTE_OPTIONS.map((attr) => (
                            <MenuItem key={attr} value={attr}>
                              {attr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size='small' sx={{ minWidth: 160 }}>
                        <InputLabel>Secundário (+1)</InputLabel>
                        <Select
                          label='Secundário (+1)'
                          value={selectedTrick?.choices?.secondary || ''}
                          onChange={(e) =>
                            handleChoiceChange('secondary', e.target.value)
                          }
                        >
                          {COMPANION_ATTRIBUTE_OPTIONS.filter(
                            (attr) => attr !== selectedTrick?.choices?.primary
                          ).map((attr) => (
                            <MenuItem key={attr} value={attr}>
                              {attr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                {isSelected &&
                  trick.hasSubChoice &&
                  trick.subChoiceType === 'movement' && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <RadioGroup
                        row
                        value={selectedTrick?.choices?.type || ''}
                        onChange={(e) =>
                          handleChoiceChange('type', e.target.value)
                        }
                      >
                        <FormControlLabel
                          value='Escalada'
                          control={<Radio size='small' />}
                          label='Escalada'
                        />
                        <FormControlLabel
                          value='Natação'
                          control={<Radio size='small' />}
                          label='Natação'
                        />
                      </RadioGroup>
                    </Box>
                  )}
                {isSelected &&
                  trick.hasSubChoice &&
                  trick.subChoiceType === 'spell' && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        Escolha uma magia de 1º círculo (arcana ou divina). A
                        magia será concedida ao melhor amigo, usando Carisma do
                        treinador como atributo-chave.
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='Buscar magia por nome, escola ou descrição...'
                        value={spellSearch}
                        onChange={(e) => setSpellSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 1 }}
                      />
                      <Box
                        sx={{
                          maxHeight: 320,
                          overflow: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {filteredInnateSpells.map((spell) => {
                          const isSpellSelected =
                            selectedSpell?.nome === spell.nome;
                          return (
                            <Card
                              key={spell.nome}
                              variant='outlined'
                              sx={{
                                cursor: 'pointer',
                                borderColor: isSpellSelected
                                  ? 'primary.main'
                                  : 'divider',
                                borderWidth: isSpellSelected ? 2 : 1,
                              }}
                              onClick={() => handleSelectSpell(spell)}
                            >
                              <CardContent sx={{ py: 1, px: 2 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {spell.nome}
                                  </Typography>
                                  <Chip
                                    label={spell.school}
                                    size='small'
                                    variant='outlined'
                                  />
                                </Box>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {spell.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          );
                        })}
                        {filteredInnateSpells.length === 0 && (
                          <Typography variant='caption' color='text.secondary'>
                            Nenhuma magia encontrada.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Alert severity='info'>
          Nenhum truque disponível para este nível e tipo de parceiro.
        </Alert>
      )}

      {selectedTrick && isSelectionComplete && (
        <Alert severity='success'>
          Truque selecionado: <strong>{selectedTrick.name}</strong>
          {selectedSpell && ` — ${selectedSpell.nome}`}
        </Alert>
      )}

      {selectedTrick && !isSelectionComplete && (
        <Alert severity='warning'>
          Preencha as escolhas do truque para continuar.
        </Alert>
      )}

      <Typography variant='caption' color='text.secondary'>
        Truques atuais: {companion.tricks.map((t) => t.name).join(', ') || '—'}
      </Typography>
    </Box>
  );
};

export default CompanionTrickSelectionStep;
