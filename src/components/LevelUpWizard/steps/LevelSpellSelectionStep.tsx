import React, { useState, useMemo } from 'react';
import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import SpellAdvancedFilters from '@/components/SpellPicker/SpellAdvancedFilters';
import {
  SpellFilterState,
  EMPTY_SPELL_FILTERS,
  deriveSpellFilterOptions,
  applySpellFilters,
} from '@/components/SpellPicker/spellFilters';

interface LevelSpellSelectionStepProps {
  availableSpells: Spell[];
  selectedSpells: Spell[];
  requiredCount: number;
  spellCircle: number;
  onSpellToggle: (spell: Spell) => void;
  crossTraditionSpellNames?: Set<string>;
  crossTraditionLimit?: number;
}

const LevelSpellSelectionStep: React.FC<LevelSpellSelectionStepProps> = ({
  availableSpells,
  selectedSpells,
  requiredCount,
  spellCircle,
  onSpellToggle,
  crossTraditionSpellNames,
  crossTraditionLimit,
}) => {
  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const handleFilterChange = (patch: Partial<SpellFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const filterOptions = useMemo(
    () => deriveSpellFilterOptions(availableSpells),
    [availableSpells]
  );

  const isSpellSelected = (spell: Spell): boolean =>
    selectedSpells.some((s) => s.nome === spell.nome);

  const isComplete = selectedSpells.length === requiredCount;

  const selectedCrossTraditionCount = useMemo(() => {
    if (!crossTraditionSpellNames || crossTraditionSpellNames.size === 0)
      return 0;
    return selectedSpells.filter((s) => crossTraditionSpellNames.has(s.nome))
      .length;
  }, [selectedSpells, crossTraditionSpellNames]);

  const isCrossTraditionLimitReached =
    crossTraditionLimit !== undefined &&
    selectedCrossTraditionCount >= crossTraditionLimit;

  const filteredSpells = useMemo(
    () => applySpellFilters(availableSpells, filters),
    [availableSpells, filters]
  );

  const filtersActive =
    filters.search !== '' ||
    filters.circle !== 'all' ||
    filters.school !== 'all' ||
    filters.execution !== 'all';

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Seleção de Magias - Até o {spellCircle}º Círculo
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 1,
        }}
      >
        Escolha {requiredCount} {requiredCount === 1 ? 'magia' : 'magias'} de
        até o {spellCircle}º círculo.
      </Typography>
      <Typography
        variant='body2'
        color={isComplete ? 'success.main' : 'warning.main'}
        sx={{ mb: 2 }}
      >
        {selectedSpells.length} de {requiredCount}{' '}
        {requiredCount === 1 ? 'magia selecionada' : 'magias selecionadas'}
      </Typography>
      {availableSpells.length === 0 && (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
          }}
        >
          Nenhuma magia disponível neste círculo. Você já conhece todas as
          magias disponíveis ou não há magias neste círculo para sua classe.
        </Typography>
      )}
      {availableSpells.length > 0 && (
        <>
          <SpellAdvancedFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            options={filterOptions}
            visibleFilters={{
              circle: true,
              school: true,
              execution: true,
            }}
            searchPlaceholder='Buscar magias por nome, escola ou descrição...'
          />

          {filteredSpells.length === 0 && filtersActive && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Nenhuma magia encontrada com os filtros atuais.
            </Typography>
          )}

          {filtersActive && filteredSpells.length > 0 && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              {filteredSpells.length}{' '}
              {filteredSpells.length === 1
                ? 'magia encontrada'
                : 'magias encontradas'}
            </Typography>
          )}
        </>
      )}
      {crossTraditionSpellNames &&
        crossTraditionSpellNames.size > 0 &&
        crossTraditionLimit && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Teurgista Místico: até {crossTraditionLimit} magia
            {crossTraditionLimit > 1 ? 's' : ''} da tradição oposta por círculo.
            {isCrossTraditionLimitReached && ' (Limite atingido)'}
          </Alert>
        )}
      <Grid container spacing={2}>
        {filteredSpells.map((spell) => {
          const selected = isSpellSelected(spell);
          const isCrossTradition =
            crossTraditionSpellNames?.has(spell.nome) ?? false;
          const canSelect =
            !selected &&
            selectedSpells.length < requiredCount &&
            !(isCrossTradition && isCrossTraditionLimitReached);

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
                  if (canSelect || selected) {
                    onSpellToggle(spell);
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
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        {spell.nome}
                      </Typography>
                      {isCrossTradition && (
                        <Chip
                          label='Cross'
                          size='small'
                          color='secondary'
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
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                      }}
                    >
                      {spell.school}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                      }}
                    >
                      {spell.execucao} • {spell.alcance}
                      {spell.alvo && ` • ${spell.alvo}`}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                      }}
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
      {!isComplete && filteredSpells.length > 0 && (
        <Typography
          variant='body2'
          sx={{
            color: 'warning.main',
            mt: 2,
            textAlign: 'center',
          }}
        >
          {requiredCount - selectedSpells.length > 0
            ? `Selecione ${requiredCount - selectedSpells.length} ${
                requiredCount - selectedSpells.length === 1
                  ? 'magia mais'
                  : 'magias mais'
              } para continuar.`
            : `Remova ${selectedSpells.length - requiredCount} ${
                selectedSpells.length - requiredCount === 1 ? 'magia' : 'magias'
              } para continuar.`}
        </Typography>
      )}
    </Box>
  );
};

export default LevelSpellSelectionStep;
