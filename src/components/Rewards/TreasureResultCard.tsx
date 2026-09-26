import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { ItemKind } from '@/data/treasure/treasureDatasets';
import type { MagicTier, TreasureEntry } from '@/data/treasure/types';
import type {
  CountRoll,
  EnhancementSet,
  ItemOutcome,
  MoneyOutcome,
  TableRoll,
  TreasureRollResult,
  WealthOutcome,
} from '@/functions/treasure/treasureRoller';

const KIND_LABELS: Record<ItemKind, string> = {
  arma: 'Arma',
  armadura: 'Armadura/escudo',
  esoterico: 'Esotérico',
  acessorio: 'Acessório',
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
  title: string;
  set: EnhancementSet;
  showBooks: boolean;
}

const Enhancements: React.FC<EnhancementsProps> = ({
  title,
  set,
  showBooks,
}) => (
  <Box sx={{ pl: { xs: 1, sm: 2 }, mt: 0.5 }}>
    <Typography variant='caption' sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Stack spacing={0.5}>
      {set.picks.map((p) => {
        const extras = [
          p.slots === 2 ? 'conta como dois' : '',
          p.includes ? `inclui ${p.includes}` : '',
          p.material ? `${p.material.name} (1d6: ${p.material.roll})` : '',
        ].filter(Boolean);
        return (
          <EntryLine
            key={`${p.roll}-${p.entry.rawName}`}
            entry={p.entry}
            rollLabel={`d% ${p.roll}`}
            showBooks={showBooks}
            suffix={extras.length ? ` (${extras.join('; ')})` : ''}
          />
        );
      })}
      {set.rejected.map((r) => (
        <Typography
          key={`rej-${r.roll}-${r.name}`}
          variant='caption'
          sx={{ color: 'text.secondary', fontStyle: 'italic' }}
        >
          Rolado novamente: {r.name} (d% {r.roll}) — {r.reason}
        </Typography>
      ))}
    </Stack>
    <Warnings warnings={set.warnings} />
  </Box>
);

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
          onClick={() => setOpen((o) => !o)}
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
}

const Money: React.FC<MoneyProps> = ({ outcome }) => {
  const { detail, row, roll } = outcome;
  return (
    <Box>
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
            <Wealth key={idx} wealth={w} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

interface ItemProps {
  outcome: ItemOutcome;
  showBooks: boolean;
  onChoose: (kind: ItemKind) => void;
}

const Item: React.FC<ItemProps> = ({ outcome, showBooks, onChoose }) => {
  const { detail, row, roll, choice } = outcome;
  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <RollTag label={`d% ${roll}`} />
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {row.label === '—' ? 'Nada' : row.label}
        </Typography>
      </Box>

      {choice && (
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
                  onClick={() => onChoose(k)}
                >
                  {KIND_LABELS[k]}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {detail?.kind === 'diverso' && (
        <EntryLine
          entry={detail.item.entry}
          rollLabel={tableRollLabel(detail.item)}
          showBooks={showBooks}
        />
      )}

      {detail?.kind === 'pocao' && (
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {detail.count.total} {detail.count.total === 1 ? 'poção' : 'poções'}
            {countText(detail.count)}
          </Typography>
          {detail.potions.map((p, idx) => (
            <EntryLine
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              entry={p.entry}
              rollLabel={tableRollLabel(p)}
              showBooks={showBooks}
              suffix={
                p.attribute
                  ? ` → ${p.attribute.name} (1d6: ${p.attribute.roll})`
                  : ''
              }
            />
          ))}
        </Stack>
      )}

      {(detail?.kind === 'equipamento' || detail?.kind === 'superior') && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {KIND_LABELS[detail.itemKind]}
            {detail.typeRoll ? ` (1d6: ${detail.typeRoll})` : ''}
          </Typography>
          <EntryLine
            entry={detail.item.entry}
            rollLabel={tableRollLabel(detail.item)}
            showBooks={showBooks}
          />
          {detail.kind === 'superior' && (
            <Enhancements
              title='Melhorias'
              set={detail.improvements}
              showBooks={showBooks}
            />
          )}
        </Box>
      )}

      {detail?.kind === 'magico' && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {KIND_LABELS[detail.itemKind]} mágico {TIER_LABELS[detail.tier]}
            {detail.typeRoll ? ` (1d6: ${detail.typeRoll})` : ''}
          </Typography>
          {detail.accessory && (
            <EntryLine
              entry={detail.accessory.entry}
              rollLabel={tableRollLabel(detail.accessory)}
              showBooks={showBooks}
            />
          )}
          {detail.specific && (
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
                      .map((p) => p.entry.name)
                      .join(', ')})`
                  : ''}
                . Item-base sorteado antes: {detail.base?.entry.name}.
              </Typography>
            </>
          )}
          {!detail.specific && detail.base && (
            <EntryLine
              entry={detail.base.entry}
              rollLabel={tableRollLabel(detail.base)}
              showBooks={showBooks}
            />
          )}
          {!detail.specific && detail.enchantments && (
            <Enhancements
              title='Encantos'
              set={detail.enchantments}
              showBooks={showBooks}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

interface TreasureResultCardProps {
  result: TreasureRollResult;
  showBooks: boolean;
  onChoose: (itemIndex: number, kind: ItemKind) => void;
}

const TreasureResultCard: React.FC<TreasureResultCardProps> = ({
  result,
  showBooks,
  onChoose,
}) => {
  const theme = useTheme();
  const headerSx = {
    fontFamily: 'Tfont, serif',
    fontWeight: 600,
    color: 'primary.main',
    mb: 1,
  };
  return (
    <Paper
      elevation={1}
      sx={{
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
          <Stack spacing={1} divider={<Divider flexItem />}>
            {result.money.map((m, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Money key={idx} outcome={m} />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant='subtitle2' sx={headerSx}>
            Itens
          </Typography>
          <Stack spacing={1} divider={<Divider flexItem />}>
            {result.items.map((it, idx) => (
              <Item
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                outcome={it}
                showBooks={showBooks}
                onChoose={(kind) => onChoose(idx, kind)}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default TreasureResultCard;
