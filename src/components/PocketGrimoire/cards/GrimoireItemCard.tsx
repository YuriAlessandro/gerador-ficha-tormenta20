import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import GrimoireCardShell from './GrimoireCardShell';
import GrimoireItemDetails from './GrimoireItemDetails';
import GrimoireMissingCard from './GrimoireMissingCard';
import { ItemAccent, ItemPresentation, presentItem } from './itemPresentation';
import { accentColor } from './accentColor';
import { STAT_META } from './statIcons';

/** Estatísticas que cabem no resumo de uma linha do card fechado. */
const SUMMARY_STATS = ['execution', 'range', 'duration'];

/** Magia: ▶ Padrão  ✺ Médio  ⧗ Instantânea. Demais itens: o subtítulo. */
const summaryOf = (view: ItemPresentation): React.ReactNode => {
  const stats = view.stats.filter((stat) => SUMMARY_STATS.includes(stat.kind));
  if (stats.length === 0) return view.summary;
  return stats.map((stat) => {
    const { label, Icon } = STAT_META[stat.kind];
    return (
      <Box
        component='span'
        key={stat.kind}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
      >
        <Icon titleAccess={label} sx={{ fontSize: '0.85rem' }} />
        {stat.value}
      </Box>
    );
  });
};

/** Tom do chip: nas magias, o do próprio rótulo (Arcana/Divina). */
const chipAccent = (label: string, fallback: ItemAccent): ItemAccent => {
  if (label === 'Arcana') return 'arcane';
  if (label === 'Divina') return 'divine';
  return fallback;
};

interface Props {
  item: ResolvedItem;
  defaultOpen: boolean;
  onRemove: (itemId: string) => void;
}

/** Card expansível do modo lista. */
const GrimoireItemCard: React.FC<Props> = ({ item, defaultOpen, onRemove }) => {
  const theme = useTheme();
  const handleRemove = () => onRemove(item.id);

  if (item.kind === 'missing') {
    return <GrimoireMissingCard name={item.name} onRemove={handleRemove} />;
  }

  const view = presentItem(item);
  return (
    <GrimoireCardShell
      title={view.title}
      summary={summaryOf(view)}
      chips={view.chips.map((label) => {
        // Mesmas cores das molduras das cartas e da legenda.
        const accent = chipAccent(label, view.accent);
        const color = accentColor(theme, accent);
        return (
          <Chip
            key={label}
            label={label}
            size='small'
            variant='filled'
            data-accent={accent}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              bgcolor: color,
              color: theme.palette.getContrastText(color),
            }}
          />
        );
      })}
      defaultOpen={defaultOpen}
      onRemove={handleRemove}
    >
      <GrimoireItemDetails item={item} />
    </GrimoireCardShell>
  );
};

export default GrimoireItemCard;
