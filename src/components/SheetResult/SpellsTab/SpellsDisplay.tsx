import React, { useCallback, useMemo, useState } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { useContainerWidth } from '@/hooks/useContainerWidth';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import CharacterSheet from '@/interfaces/CharacterSheet';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import { CharacterAttribute } from '@/interfaces/Character';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import {
  EMPTY_SPELL_FILTERS,
  SpellFilterState,
  applySpellFilters,
  deriveSpellFilterOptions,
  getCircleNumber,
} from '@/components/SpellPicker/spellFilters';
import SpellCastDialog from '@/components/SpellCastDialog';
import {
  EMPTY_SX,
  GROUP_COUNT_SX,
  GROUP_HEADER_SX,
  GROUP_TITLE_SX,
} from '../common/listStyles';
import SpellDetailSheet from './SpellDetailSheet';
import SpellRow from './SpellRow';
import { getSpellActiveEffectDefinition } from './spellActiveEffect';
import SpellsHeaderStats from './SpellsHeaderStats';
import SpellsToolbar, { CircleFilterOption } from './SpellsToolbar';
import { SheetSpellToggles } from './SpellsFilterPopover';
import { CIRCLE_PM_SX } from './spellsTabStyles';

/**
 * Abaixo disso a linha vira botão e o detalhe abre em bottom sheet. Medido no
 * CONTAINER, não no viewport: a aba vive num card de ~60% de largura e ainda é
 * embarcada no iframe do Owlbear, no widget da tela do mestre e no diálogo de
 * ficha do mestre — um `useMediaQuery` responderia a pergunta errada em todos
 * esses casos.
 */
const COMPACT_BREAKPOINT = 560;

/** Abaixo disso a busca atrapalha mais do que ajuda. */
const TOOLBAR_MIN_SPELLS = 8;

const KNOWN_CIRCLES = Object.values(spellsCircles);

const EMPTY_TOGGLES: SheetSpellToggles = {
  onlyWithRolls: false,
  onlyMemorized: false,
};

interface SpellGroup {
  key: string;
  label: string;
  /** `null` no grupo "Outras": círculo desconhecido não tem custo tabelado. */
  circle: spellsCircles | null;
  spells: Spell[];
}

/**
 * Agrupa por círculo na ordem do enum.
 *
 * O layout antigo descartava em silêncio qualquer magia cujo `spellCircle` não
 * fosse um dos cinco valores do enum — magia homebrew com círculo escrito
 * diferente simplesmente sumia da ficha. Aqui elas caem num grupo "Outras".
 */
const groupByCircle = (spells: Spell[]): SpellGroup[] => {
  const groups: SpellGroup[] = [];

  KNOWN_CIRCLES.forEach((circle) => {
    const circleSpells = spells
      .filter((s) => s.spellCircle === circle)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (circleSpells.length > 0) {
      groups.push({ key: circle, label: circle, circle, spells: circleSpells });
    }
  });

  const orphans = spells
    .filter((s) => !KNOWN_CIRCLES.includes(s.spellCircle))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (orphans.length > 0) {
    groups.push({
      key: '__outras__',
      label: 'Outras',
      circle: null,
      spells: orphans,
    });
  }

  return groups;
};

export interface SpellsDisplayProps {
  spells: Spell[];
  keyAttr: CharacterAttribute | null;
  selectedKeyAttribute: Atributo;
  nivel: number;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
  currentPM?: number;
  maxPM?: number;
  tempPM?: number;
  onSpellCast?: (pmSpent: number, spell: Spell, castLogged?: boolean) => void;
  isMago?: boolean;
  onToggleMemorized?: (spell: Spell) => void;
  onToggleAlwaysPrepared?: (spell: Spell) => void;
  onKeyAttributeChange?: (newAttr: Atributo) => void;
  bonusSpellDC?: number;
  /**
   * Aviso por círculo quando a divindade limita o alcance do devoto
   * (deus menor). Computado no render pelo pai — nunca persistido.
   */
  getCircleWarning?: (circle: number) => string | null;
  /**
   * Ficha e callback de ativação. Presentes, a estrelinha da linha vira botão
   * e abre o diálogo de tipos de uso — o mesmo caminho da aba de Poderes.
   */
  sheet?: CharacterSheet;
  onActivateEffect?: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
}

const SpellsDisplay: React.FC<SpellsDisplayProps> = ({
  spells,
  keyAttr,
  selectedKeyAttribute,
  nivel,
  onUpdateRolls,
  characterName,
  currentPM,
  maxPM,
  tempPM,
  onSpellCast,
  isMago,
  onToggleMemorized,
  onToggleAlwaysPrepared,
  onKeyAttributeChange,
  bonusSpellDC,
  getCircleWarning,
  sheet,
  onActivateEffect,
}) => {
  const { hasAccess: canUseActiveEffects } = useFeatureAccess('activeEffects');
  const [containerRef, containerWidth] = useContainerWidth<HTMLDivElement>();
  const compact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT;

  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const [toggles, setToggles] = useState<SheetSpellToggles>(EMPTY_TOGGLES);
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null);
  const [castingSpell, setCastingSpell] = useState<Spell | null>(null);

  const mod = keyAttr ? keyAttr.value : 0;
  const bonus = bonusSpellDC || 0;
  const resistance = 10 + Math.floor(nivel * 0.5) + mod + bonus;

  const filterOptions = useMemo(
    () => deriveSpellFilterOptions(spells),
    [spells]
  );

  const applyToggles = useCallback(
    (list: Spell[]) =>
      list.filter((spell) => {
        if (toggles.onlyWithRolls && !spell.rolls?.length) return false;
        if (
          toggles.onlyMemorized &&
          !spell.memorized &&
          !spell.alwaysPrepared
        ) {
          return false;
        }
        return true;
      }),
    [toggles]
  );

  /**
   * Tudo menos o círculo. As contagens dos chips saem daqui e não do resultado
   * final: se saíssem do filtrado, escolher um círculo zeraria a contagem de
   * todos os outros e o jogador perderia a noção do que existe.
   */
  const withoutCircle = useMemo(
    () =>
      applyToggles(applySpellFilters(spells, { ...filters, circle: 'all' })),
    [spells, filters, applyToggles]
  );

  const visible = useMemo(
    () =>
      filters.circle === 'all'
        ? withoutCircle
        : withoutCircle.filter(
            (s) => getCircleNumber(s.spellCircle) === filters.circle
          ),
    [withoutCircle, filters.circle]
  );

  const circleOptions = useMemo<CircleFilterOption[]>(
    () =>
      filterOptions.circles.map((circle) => ({
        circle,
        label: `${circle}º`,
        count: withoutCircle.filter(
          (s) => getCircleNumber(s.spellCircle) === circle
        ).length,
      })),
    [filterOptions.circles, withoutCircle]
  );

  const groups = useMemo(() => groupByCircle(visible), [visible]);

  const magoCounters = useMemo(() => {
    const preparable = spells.filter((s) => !s.alwaysPrepared);
    return {
      memorizedCount: preparable.filter((s) => s.memorized).length,
      memorizedLimit: Math.floor(preparable.length / 2),
      alwaysPreparedCount: spells.filter((s) => s.alwaysPrepared).length,
    };
  }, [spells]);

  const activeFilterCount =
    (filters.school !== 'all' ? 1 : 0) +
    (filters.execution !== 'all' ? 1 : 0) +
    (toggles.onlyWithRolls ? 1 : 0) +
    (toggles.onlyMemorized ? 1 : 0);

  const handleReset = useCallback(() => {
    setFilters(EMPTY_SPELL_FILTERS);
    setToggles(EMPTY_TOGGLES);
  }, []);

  const handleCast = useCallback(
    (pmSpent: number, castSpell: Spell, castLogged?: boolean) => {
      onSpellCast?.(pmSpent, castSpell, castLogged);
    },
    [onSpellCast]
  );

  const handleOpenCast = useCallback((spell: Spell) => {
    setCastingSpell(spell);
    // Se o detalhe estava aberto no compacto, ele sai da frente do diálogo.
    setDetailSpell(null);
  }, []);

  if (spells.length === 0) {
    return <Typography sx={EMPTY_SX}>Não Possui</Typography>;
  }

  const showToolbar = spells.length >= TOOLBAR_MIN_SPELLS;
  const hasActiveQuery =
    !!filters.search || filters.circle !== 'all' || activeFilterCount > 0;

  return (
    <Box ref={containerRef} sx={{ minWidth: 0 }}>
      <SpellsHeaderStats
        keyAttr={keyAttr}
        selectedKeyAttribute={selectedKeyAttribute}
        onKeyAttributeChange={onKeyAttributeChange}
        resistance={resistance}
        bonusSpellDC={bonus}
        isMago={isMago}
        memorizedCount={magoCounters.memorizedCount}
        memorizedLimit={magoCounters.memorizedLimit}
        alwaysPreparedCount={magoCounters.alwaysPreparedCount}
      />

      {showToolbar && (
        <SpellsToolbar
          filters={filters}
          onFiltersChange={setFilters}
          toggles={toggles}
          onTogglesChange={setToggles}
          circleOptions={circleOptions}
          schools={filterOptions.schools}
          executions={filterOptions.executions}
          isMago={isMago}
          activeFilterCount={activeFilterCount}
          onReset={handleReset}
        />
      )}

      {groups.length === 0 ? (
        <Box sx={EMPTY_SX}>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Nenhuma magia encontrada.
          </Typography>
          {hasActiveQuery && (
            <Button size='small' onClick={handleReset}>
              Limpar filtros
            </Button>
          )}
        </Box>
      ) : (
        groups.map((group) => {
          const warning = group.circle
            ? getCircleWarning?.(getCircleNumber(group.circle))
            : null;
          return (
            <Box key={group.key}>
              <Box sx={GROUP_HEADER_SX}>
                <Typography variant='subtitle2' sx={GROUP_TITLE_SX}>
                  {group.label}
                  {group.circle && (
                    <Typography component='span' sx={CIRCLE_PM_SX}>
                      {' · '}
                      {manaExpenseByCircle[group.circle]} PM
                    </Typography>
                  )}
                </Typography>
                {warning && (
                  <Tooltip title={warning}>
                    <Chip
                      size='small'
                      color='warning'
                      icon={<WarningAmberIcon />}
                      label='Indisponível'
                    />
                  </Tooltip>
                )}
                <Typography variant='caption' sx={GROUP_COUNT_SX}>
                  {group.spells.length}
                </Typography>
              </Box>
              {group.spells.map((spell) => (
                <SpellRow
                  key={spell.nome}
                  spell={spell}
                  compact={compact}
                  onOpenDetail={() => setDetailSpell(spell)}
                  onOpenCast={() => handleOpenCast(spell)}
                  isMago={isMago}
                  onToggleMemorized={onToggleMemorized}
                  onToggleAlwaysPrepared={onToggleAlwaysPrepared}
                  activeEffect={
                    canUseActiveEffects
                      ? getSpellActiveEffectDefinition(spell, nivel)
                      : null
                  }
                  sheet={sheet}
                  onActivateEffect={onActivateEffect}
                />
              ))}
            </Box>
          );
        })
      )}

      <SpellDetailSheet
        open={!!detailSpell}
        onClose={() => setDetailSpell(null)}
        compact={compact}
        spell={detailSpell}
        onCast={detailSpell ? () => handleOpenCast(detailSpell) : undefined}
      />

      {/*
        UMA instância, não uma por linha como no layout antigo. A `key` por magia
        é obrigatória: o diálogo semeia rolagens e seleções de aprimoramento num
        efeito de abertura, então sem remontar o estado de uma conjuração
        vazaria para a próxima.
      */}
      {castingSpell && (
        <SpellCastDialog
          key={castingSpell.nome}
          open
          onClose={() => setCastingSpell(null)}
          spell={castingSpell}
          currentPM={currentPM ?? 0}
          maxPM={maxPM ?? 0}
          tempPM={tempPM}
          onCast={handleCast}
          onUpdateRolls={onUpdateRolls}
          characterName={characterName}
        />
      )}
    </Box>
  );
};

export default SpellsDisplay;
