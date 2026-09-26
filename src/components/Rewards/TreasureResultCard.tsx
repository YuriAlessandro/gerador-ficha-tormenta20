import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type {
  ItemKind,
  TreasureDataset,
} from '@/data/treasure/treasureDatasets';
import type { MagicTier, TreasureEntry } from '@/data/treasure/types';
import { buildRevealSteps } from '@/functions/treasure/revealSteps';
import type {
  CountRoll,
  EnhancementPick,
  EnhancementSet,
  ItemOutcome,
  MoneyOutcome,
  TableRoll,
  TreasureRollResult,
  WealthOutcome,
} from '@/functions/treasure/treasureRoller';

import SlotReel from './SlotReel';
import {
  RevealSequence,
  RevealStage,
  useRevealSequence,
} from './useRevealSequence';

const KIND_LABELS: Record<ItemKind, string> = {
  arma: 'Arma',
  armadura: 'Armadura/escudo',
  esoterico: 'Esotérico',
  acessorio: 'Acessório',
};

// ---------------------------------------------------------------------------
// Encenação (caça-níquel)
// ---------------------------------------------------------------------------

/** Sem provedor (ou animação desligada): tudo já revelado. */
const ALL_DONE: RevealSequence = {
  stageOf: () => 'done',
  onStepDone: () => undefined,
  animating: false,
  skip: () => undefined,
  stepById: () => undefined,
};

const RevealContext = createContext<RevealSequence>(ALL_DONE);

const useStage = (id: string): RevealStage =>
  useContext(RevealContext).stageOf(id);

interface RevealSlotProps {
  id: string;
  children: React.ReactNode;
}

/** Um ponto de rolagem: nada → rolo girando → conteúdo final. */
const RevealSlot: React.FC<RevealSlotProps> = ({ id, children }) => {
  const reveal = useContext(RevealContext);
  const stage = reveal.stageOf(id);
  const step = reveal.stepById(id);
  if (stage === 'hidden') return null;
  if (stage === 'spinning' && step && step.kind === 'reel') {
    return (
      <SlotReel
        lines={step.lines}
        finalIndex={step.finalIndex}
        size={step.size}
        rejectedReason={step.rejectedReason}
        onDone={() => reveal.onStepDone(id)}
      />
    );
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

const TIER_LABELS: Record<MagicTier, string> = {
  menor: 'menor',
  medio: 'médio',
  maior: 'maior',
};

const formatNumber = (n: number) => n.toLocaleString('pt-BR');

const countText = (count: CountRoll) =>
  count.rolls.length > 0 ? ` (dados: ${count.rolls.join(' + ')})` : '';

interface RollTagProps {
  label: string;
}

const RollTag: React.FC<RollTagProps> = ({ label }) => (
  <Typography
    component='span'
    variant='caption'
    sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mr: 1 }}
  >
    {label}
  </Typography>
);

interface EntryLineProps {
  entry: TreasureEntry;
  rollLabel: string;
  showBooks: boolean;
  suffix?: string;
}

const EntryLine: React.FC<EntryLineProps> = ({
  entry,
  rollLabel,
  showBooks,
  suffix,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 1,
      rowGap: 0.5,
    }}
  >
    <RollTag label={rollLabel} />
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {entry.name}
      {suffix}
      {entry.price !== undefined ? ` — T$ ${formatNumber(entry.price)}` : ''}
    </Typography>
    {showBooks && entry.book && (
      <Chip
        size='small'
        variant='outlined'
        label={`${entry.book}${entry.page ? `, p. ${entry.page}` : ''}`}
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    )}
  </Box>
);

const tableRollLabel = (t: TableRoll) =>
  t.lookup !== t.roll ? `d% ${t.roll} (+% → ${t.lookup})` : `d% ${t.roll}`;

interface WarningsProps {
  warnings: string[];
}

const Warnings: React.FC<WarningsProps> = ({ warnings }) =>
  warnings.length === 0 ? null : (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {Array.from(new Set(warnings)).map((w) => (
        <Alert
          key={w}
          severity='warning'
          sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.8rem' } }}
        >
          {w}
        </Alert>
      ))}
    </Stack>
  );

interface EnhancementsProps {
  /** Prefixo dos passos (`item-0`): as tentativas são `${prefix}-att-${k}`. */
  prefix: string;
  title: string;
  set: EnhancementSet;
  /** Escolhas aceitas, na ordem (no item específico, as descartadas). */
  picks: EnhancementPick[];
  showBooks: boolean;
}

const Enhancements: React.FC<EnhancementsProps> = ({
  prefix,
  title,
  set,
  picks,
  showBooks,
}) => {
  const firstStage = useStage(`${prefix}-att-0`);
  const lastStage = useStage(`${prefix}-att-${set.attempts.length - 1}`);
  if (set.attempts.length === 0 || firstStage === 'hidden') return null;
  let pickIdx = 0;
  return (
    <Box sx={{ pl: { xs: 1, sm: 2 }, mt: 0.5 }}>
      <Typography variant='caption' sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {set.attempts.map((a, k) => {
          const id = `${prefix}-att-${k}`;
          const key = `${k}-${a.roll}`;
          if (!a.accepted) {
            return (
              <RevealSlot key={key} id={id}>
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Rolado novamente: {a.entry.rawName} (d% {a.roll}) — {a.reason}
                </Typography>
              </RevealSlot>
            );
          }
          if (a.entry.rollOnSpecificTable) {
            return (
              <RevealSlot key={key} id={id}>
                <EntryLine
                  entry={a.entry}
                  rollLabel={`d% ${a.roll}`}
                  showBooks={showBooks}
                  suffix=' → role na tabela de específicos'
                />
              </RevealSlot>
            );
          }
          const p = picks[pickIdx];
          pickIdx += 1;
          const extras = p
            ? [
                p.slots === 2 ? 'conta como dois' : '',
                p.includes ? `inclui ${p.includes}` : '',
                p.material
                  ? `${p.material.name} (1d6: ${p.material.roll})`
                  : '',
              ].filter(Boolean)
            : [];
          return (
            <RevealSlot key={key} id={id}>
              <EntryLine
                entry={a.entry}
                rollLabel={`d% ${a.roll}`}
                showBooks={showBooks}
                suffix={extras.length ? ` (${extras.join('; ')})` : ''}
              />
            </RevealSlot>
          );
        })}
      </Stack>
      {lastStage === 'done' && <Warnings warnings={set.warnings} />}
    </Box>
  );
};

interface WealthProps {
  wealth: WealthOutcome;
}

const Wealth: React.FC<WealthProps> = ({ wealth }) => {
  const [open, setOpen] = useState(false);
  const roll =
    wealth.lookup !== wealth.roll
      ? `d% ${wealth.roll} (+% → ${wealth.lookup})`
      : `d% ${wealth.roll}`;
  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <RollTag label={roll} />
        <Typography variant='body2' sx={{ fontWeight: 500, mr: 1 }}>
          Riqueza de T$ {formatNumber(wealth.value)}
        </Typography>
        <RollTag
          label={`${wealth.row.valueLabel}: ${wealth.valueRolls.join(' + ')}`}
        />
        <Button
          size='small'
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          sx={{ minWidth: 0, p: 0, textTransform: 'none' }}
        >
          {open ? 'ocultar exemplos' : 'ver exemplos'}
        </Button>
      </Box>
      <Collapse in={open}>
        <Box component='ul' sx={{ m: 0, pl: 3 }}>
          {wealth.row.examples.map((ex) => (
            <Typography
              component='li'
              variant='caption'
              key={`${ex.spaces}-${ex.text}`}
              sx={{ display: 'list-item' }}
            >
              {ex.spaces ? <strong>{ex.spaces}: </strong> : null}
              {ex.text}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

interface MoneyProps {
  outcome: MoneyOutcome;
  index: number;
}

const separatorSx = (index: number) =>
  index > 0
    ? { borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }
    : undefined;

const Money: React.FC<MoneyProps> = ({ outcome, index }) => {
  const { detail, row, roll } = outcome;
  const id = `money-${index}`;
  return (
    <RevealSlot id={id}>
      <Box sx={separatorSx(index)}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <RollTag label={`d% ${roll}`} />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {row.label === '—' ? 'Nada' : row.label}
          </Typography>
        </Box>
        {detail.kind === 'coins' && (
          <Typography variant='body1' sx={{ fontWeight: 600 }}>
            {formatNumber(detail.halved ?? detail.amount)} {detail.currency}
            <Typography
              component='span'
              variant='caption'
              sx={{ color: 'text.secondary', ml: 1 }}
            >
              {detail.halved !== undefined
                ? `metade de ${formatNumber(detail.amount)}`
                : ''}
              {countText(detail.count)}
            </Typography>
          </Typography>
        )}
        {detail.kind === 'riqueza' && (
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {detail.count.total}{' '}
              {detail.count.total === 1 ? 'riqueza' : 'riquezas'}
              {countText(detail.count)}
            </Typography>
            {detail.wealth.map((w, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <RevealSlot key={idx} id={`${id}-wealth-${idx}`}>
                <Wealth wealth={w} />
              </RevealSlot>
            ))}
          </Stack>
        )}
      </Box>
    </RevealSlot>
  );
};

interface ItemProps {
  outcome: ItemOutcome;
  index: number;
  showBooks: boolean;
  onChoose: (kind: ItemKind) => void;
}

const stopClick = (e: React.MouseEvent) => e.stopPropagation();

const Item: React.FC<ItemProps> = ({ outcome, index, showBooks, onChoose }) => {
  const { detail, row, roll, choice } = outcome;
  const p = `item-${index}`;
  return (
    <RevealSlot id={p}>
      <Box sx={separatorSx(index)}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <RollTag label={`d% ${roll}`} />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {row.label === '—' ? 'Nada' : row.label}
          </Typography>
        </Box>

        {choice && (
          <RevealSlot id={`${p}-choice`}>
            <Box sx={{ mt: 0.5 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                2D: {choice.dice[0]} → {KIND_LABELS[choice.options[0]]};{' '}
                {choice.dice[1]} → {KIND_LABELS[choice.options[1]]}
                {detail ? ' (mesmo tipo)' : ' — escolha um:'}
              </Typography>
              {!detail && (
                <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                  {choice.options.map((k) => (
                    <Button
                      key={k}
                      size='small'
                      variant='outlined'
                      onClick={(e) => {
                        stopClick(e);
                        onChoose(k);
                      }}
                    >
                      {KIND_LABELS[k]}
                    </Button>
                  ))}
                </Stack>
              )}
            </Box>
          </RevealSlot>
        )}

        {detail?.kind === 'diverso' && (
          <RevealSlot id={`${p}-diverso`}>
            <EntryLine
              entry={detail.item.entry}
              rollLabel={tableRollLabel(detail.item)}
              showBooks={showBooks}
            />
          </RevealSlot>
        )}

        {detail?.kind === 'pocao' && (
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {detail.count.total}{' '}
              {detail.count.total === 1 ? 'poção' : 'poções'}
              {countText(detail.count)}
            </Typography>
            {detail.potions.map((potion, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <RevealSlot key={idx} id={`${p}-potion-${idx}`}>
                <EntryLine
                  entry={potion.entry}
                  rollLabel={tableRollLabel(potion)}
                  showBooks={showBooks}
                  suffix={
                    potion.attribute
                      ? ` → ${potion.attribute.name} (1d6: ${potion.attribute.roll})`
                      : ''
                  }
                />
              </RevealSlot>
            ))}
          </Stack>
        )}

        {(detail?.kind === 'equipamento' || detail?.kind === 'superior') && (
          <Box sx={{ mt: 0.5 }}>
            <RevealSlot id={detail.typeRoll ? `${p}-type` : `${p}-choice`}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {KIND_LABELS[detail.itemKind]}
                {detail.typeRoll ? ` (1d6: ${detail.typeRoll})` : ''}
              </Typography>
            </RevealSlot>
            <RevealSlot id={`${p}-base`}>
              <EntryLine
                entry={detail.item.entry}
                rollLabel={tableRollLabel(detail.item)}
                showBooks={showBooks}
              />
            </RevealSlot>
            {detail.kind === 'superior' && (
              <Enhancements
                prefix={p}
                title='Melhorias'
                set={detail.improvements}
                picks={detail.improvements.picks}
                showBooks={showBooks}
              />
            )}
          </Box>
        )}

        {detail?.kind === 'magico' && (
          <Box sx={{ mt: 0.5 }}>
            <RevealSlot id={detail.typeRoll ? `${p}-type` : `${p}-choice`}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {KIND_LABELS[detail.itemKind]} mágico {TIER_LABELS[detail.tier]}
                {detail.typeRoll ? ` (1d6: ${detail.typeRoll})` : ''}
              </Typography>
            </RevealSlot>
            {detail.accessory && (
              <RevealSlot id={`${p}-accessory`}>
                <EntryLine
                  entry={detail.accessory.entry}
                  rollLabel={tableRollLabel(detail.accessory)}
                  showBooks={showBooks}
                />
              </RevealSlot>
            )}
            {detail.base && (
              <RevealSlot id={`${p}-base`}>
                <EntryLine
                  entry={detail.base.entry}
                  rollLabel={tableRollLabel(detail.base)}
                  showBooks={showBooks}
                  suffix={detail.specific ? ' (item-base sorteado)' : ''}
                />
              </RevealSlot>
            )}
            {detail.enchantments && (
              <Enhancements
                prefix={p}
                title='Encantos'
                set={detail.enchantments}
                picks={
                  detail.specific
                    ? detail.specific.discarded
                    : detail.enchantments.picks
                }
                showBooks={showBooks}
              />
            )}
            {detail.specific && (
              <RevealSlot id={`${p}-specific`}>
                <>
                  <EntryLine
                    entry={detail.specific.entry}
                    rollLabel={`específico: ${tableRollLabel(detail.specific)}`}
                    showBooks={showBooks}
                  />
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                  >
                    Item específico: o item perde quaisquer encantos rolados
                    {detail.specific.discarded.length > 0
                      ? ` (${detail.specific.discarded
                          .map((d) => d.entry.name)
                          .join(', ')})`
                      : ''}
                    .
                  </Typography>
                </>
              </RevealSlot>
            )}
          </Box>
        )}
      </Box>
    </RevealSlot>
  );
};

interface TreasureResultCardProps {
  result: TreasureRollResult;
  dataset: TreasureDataset;
  onChoose: (itemIndex: number, kind: ItemKind) => void;
  /** Encena as rolagens como caça-níquel. */
  animate: boolean;
  /** Atraso antes do primeiro rolo (defasagem entre cards). */
  startDelay?: number;
  /** Muda para pular a animação de todos os cards. */
  skipToken?: number;
  onAnimatingChange?: (animating: boolean) => void;
}

const TreasureResultCard: React.FC<TreasureResultCardProps> = ({
  result,
  dataset,
  onChoose,
  animate,
  startDelay = 0,
  skipToken = 0,
  onAnimatingChange,
}) => {
  const theme = useTheme();
  const { showBooks } = dataset;
  const steps = useMemo(
    () => buildRevealSteps(result, dataset),
    [result, dataset]
  );
  const reveal = useRevealSequence(steps, animate, startDelay, skipToken);
  const { animating } = reveal;

  useEffect(() => {
    onAnimatingChange?.(animating);
  }, [animating, onAnimatingChange]);

  const headerSx = {
    fontFamily: 'Tfont, serif',
    fontWeight: 600,
    color: 'primary.main',
    mb: 1,
  };
  return (
    <RevealContext.Provider value={reveal}>
      <Paper
        elevation={1}
        onClick={animating ? reveal.skip : undefined}
        title={animating ? 'Clique para pular a animação' : undefined}
        sx={{
          cursor: animating ? 'pointer' : 'default',
          mb: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          borderTop: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Stack direction='row' spacing={1} sx={{ mb: 1.5 }}>
          <Chip
            label={`ND ${result.nd}`}
            size='small'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif' }}
          />
          {result.multiplier !== 'Padrão' && (
            <Chip label={result.multiplier} size='small' variant='outlined' />
          )}
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant='subtitle2' sx={headerSx}>
              Dinheiro
            </Typography>
            <Box>
              {result.money.map((m, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Money key={idx} outcome={m} index={idx} />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant='subtitle2' sx={headerSx}>
              Itens
            </Typography>
            <Box>
              {result.items.map((it, idx) => (
                <Item
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  outcome={it}
                  index={idx}
                  showBooks={showBooks}
                  onChoose={(kind) => onChoose(idx, kind)}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </RevealContext.Provider>
  );
};

export default TreasureResultCard;
