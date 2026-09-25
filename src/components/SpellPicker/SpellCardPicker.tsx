import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import { countTowardsCrossMinimum } from '@/functions/spellPathUtils';
import SpellAdvancedFilters from '@/components/SpellPicker/SpellAdvancedFilters';
import {
  SpellFilterState,
  EMPTY_SPELL_FILTERS,
  deriveSpellFilterOptions,
  applySpellFilters,
} from '@/components/SpellPicker/spellFilters';

/** Nomes por tradição, para o filtro "Tipo" de quem aprende das duas. */
export interface SpellTraditionNames {
  arcane: Set<string>;
  divine: Set<string>;
}

interface SpellCardPickerProps {
  availableSpells: Spell[];
  selectedSpells: Spell[];
  requiredCount: number;
  onToggle: (spell: Spell) => void;
  /** Magias da tradição oposta (Teurgista Místico, Linhagem Abençoada). */
  crossTraditionSpellNames?: Set<string>;
  /** Rótulo do chip das magias da tradição oposta ("Divina", "Arcana"). */
  crossTraditionLabel?: string;
  /** Teurgista Místico: máximo de magias da tradição oposta POR CÍRCULO. */
  crossTraditionLimit?: number;
  /** Universais (nas duas listas): podem preencher o mínimo abaixo. */
  sharedTraditionSpellNames?: Set<string>;
  /** Linhagem Abençoada: ao menos N das escolhidas da tradição oposta. */
  minCrossTraditionSpells?: number;
  /** Presente = mostra o filtro arcana/divina. */
  traditionNames?: SpellTraditionNames;
  emptyMessage?: string;
}

/**
 * Seletor de magias em cards, usado na criação de personagem e no level-up.
 * Só apresentação e regras de seleção: quem chama monta o pool de magias.
 */
const SpellCardPicker: React.FC<SpellCardPickerProps> = ({
  availableSpells,
  selectedSpells,
  requiredCount,
  onToggle,
  crossTraditionSpellNames,
  crossTraditionLabel = 'Outra tradição',
  crossTraditionLimit,
  minCrossTraditionSpells = 0,
  sharedTraditionSpellNames,
  traditionNames,
  emptyMessage = 'Nenhuma magia disponível.',
}) => {
  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const handleFilterChange = (patch: Partial<SpellFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const filterOptions = useMemo(
    () => deriveSpellFilterOptions(availableSpells),
    [availableSpells]
  );

  const filteredSpells = useMemo(() => {
    let result = applySpellFilters(availableSpells, filters);
    if (traditionNames && filters.spellType !== 'all') {
      const names = traditionNames[filters.spellType];
      result = result.filter((spell) => names.has(spell.nome));
    }
    return result;
  }, [availableSpells, filters, traditionNames]);

  const filtersActive =
    filters.search !== '' ||
    filters.circles.length > 0 ||
    filters.schools.length > 0 ||
    filters.executions.length > 0 ||
    filters.spellType !== 'all';

  const isCross = (spell: Spell): boolean =>
    crossTraditionSpellNames?.has(spell.nome) ?? false;

  // Teurgista Místico: o limite de magias cross é POR CÍRCULO. Contamos as
  // magias cross já selecionadas agrupadas pelo círculo da magia.
  const selectedCrossByCircle = useMemo(() => {
    const map = new Map<string, number>();
    selectedSpells.forEach((spell) => {
      if (crossTraditionSpellNames?.has(spell.nome)) {
        map.set(spell.spellCircle, (map.get(spell.spellCircle) || 0) + 1);
      }
    });
    return map;
  }, [selectedSpells, crossTraditionSpellNames]);

  const shared = sharedTraditionSpellNames ?? new Set<string>();
  const selectedCrossCount = countTowardsCrossMinimum(
    selectedSpells,
    crossTraditionSpellNames ?? new Set<string>(),
    shared,
    requiredCount,
    minCrossTraditionSpells
  );
  // Vagas da tradição nativa esgotadas: outra exclusiva dela deixaria o mínimo
  // da tradição oposta impossível — só cross e universal seguem liberadas.
  const selectedNativeOnly = selectedSpells.filter(
    (spell) =>
      !crossTraditionSpellNames?.has(spell.nome) && !shared.has(spell.nome)
  ).length;
  const nativeSlotsFull =
    minCrossTraditionSpells > 0 &&
    selectedNativeOnly >= requiredCount - minCrossTraditionSpells;
  const isAnyCrossCircleAtLimit =
    crossTraditionLimit !== undefined &&
    Array.from(selectedCrossByCircle.values()).some(
      (count) => count >= crossTraditionLimit
    );
  const isMinCrossMet = selectedCrossCount >= minCrossTraditionSpells;
  const isComplete = selectedSpells.length === requiredCount && isMinCrossMet;
  const missing = requiredCount - selectedSpells.length;

  const isSelected = (spell: Spell): boolean =>
    selectedSpells.some((s) => s.nome === spell.nome);

  if (availableSpells.length === 0) {
    return <Alert severity='warning'>{emptyMessage}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        variant='body2'
        color={isComplete ? 'success.main' : 'warning.main'}
      >
        {selectedSpells.length} de {requiredCount}{' '}
        {requiredCount === 1 ? 'magia selecionada' : 'magias selecionadas'}
      </Typography>

      {crossTraditionLimit !== undefined &&
        (crossTraditionSpellNames?.size ?? 0) > 0 && (
          <Alert severity='info'>
            Teurgista Místico: até {crossTraditionLimit} magia
            {crossTraditionLimit > 1 ? 's' : ''} da tradição oposta por círculo.
            {isAnyCrossCircleAtLimit && ' (Limite do círculo atingido)'}
          </Alert>
        )}

      {minCrossTraditionSpells > 0 && (
        <Alert severity={isMinCrossMet ? 'success' : 'warning'}>
          Ao menos {minCrossTraditionSpells} das {requiredCount} magias precisa
          ser {crossTraditionLabel.toLowerCase()} ({selectedCrossCount}{' '}
          selecionada{selectedCrossCount === 1 ? '' : 's'}).
          {shared.size > 0 &&
            ' Magias universais contam para esse mínimo depois de preencherem as demais vagas.'}
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
                onDelete={() => onToggle(spell)}
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
          circle: true,
          school: true,
          execution: true,
          spellType: !!traditionNames,
        }}
        searchPlaceholder='Buscar magias por nome, escola ou descrição...'
      />

      {filtersActive && (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {filteredSpells.length === 0
            ? 'Nenhuma magia encontrada com os filtros atuais.'
            : `${filteredSpells.length} ${
                filteredSpells.length === 1
                  ? 'magia encontrada'
                  : 'magias encontradas'
              }`}
        </Typography>
      )}

      <Grid container spacing={2}>
        {filteredSpells.map((spell) => {
          const selected = isSelected(spell);
          const cross = isCross(spell);
          const universal = shared.has(spell.nome);
          const circleAtLimit =
            crossTraditionLimit !== undefined &&
            (selectedCrossByCircle.get(spell.spellCircle) || 0) >=
              crossTraditionLimit;
          const canSelect =
            !selected &&
            selectedSpells.length < requiredCount &&
            !(cross && circleAtLimit) &&
            !(nativeSlotsFull && !cross && !universal);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spell.nome}>
              <Card
                variant='outlined'
                sx={{
                  cursor: canSelect || selected ? 'pointer' : 'default',
                  border: selected ? 2 : 1,
                  borderColor: selected ? 'primary.main' : 'divider',
                  opacity: !canSelect && !selected ? 0.5 : 1,
                  '&:hover': {
                    borderColor:
                      canSelect || selected ? 'primary.light' : 'divider',
                    bgcolor: canSelect || selected ? 'action.hover' : 'inherit',
                  },
                  height: '100%',
                }}
                onClick={() => {
                  if (canSelect || selected) onToggle(spell);
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        {spell.nome}
                      </Typography>
                      {cross && (
                        <Chip
                          label={crossTraditionLabel}
                          size='small'
                          color='secondary'
                          variant='outlined'
                        />
                      )}
                      {universal && minCrossTraditionSpells > 0 && (
                        <Chip
                          label='Universal'
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>
                    <Chip
                      label={spell.spellCircle}
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      {spell.school}
                      {spell.manaExpense !== undefined &&
                        ` • ${spell.manaExpense} PM`}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      {spell.execucao} • {spell.alcance}
                      {spell.alvo && ` • ${spell.alvo}`}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Duração: {spell.duracao}
                    </Typography>
                  </Box>

                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {spell.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {!isComplete && (
        <Typography
          variant='body2'
          sx={{ color: 'warning.main', textAlign: 'center' }}
        >
          {missing > 0 &&
            `Selecione ${missing} ${
              missing === 1 ? 'magia mais' : 'magias mais'
            } para continuar.`}
          {missing < 0 &&
            `Remova ${-missing} ${
              missing === -1 ? 'magia' : 'magias'
            } para continuar.`}
          {missing === 0 &&
            `Troque uma magia por uma ${crossTraditionLabel.toLowerCase()} para continuar.`}
        </Typography>
      )}
    </Box>
  );
};

export default SpellCardPicker;
