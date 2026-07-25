import React, { useMemo } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Equipment, { equipGroup } from '@/interfaces/Equipment';
import { getItemSpaces } from '@/interfaces/Bag';
import {
  EquipmentStat,
  getStatsForGroup,
  statTrack,
} from '@/functions/equipmentStats';
import { useContainerWidth } from '@/hooks/useContainerWidth';
import { getSupplementInitials } from '@/functions/equipmentDisplay';
import RollButton from '../RollButton';
import { CATEGORY_ORDER, itemTypeStyles } from './BackpackModal/itemTypeStyles';

interface EquipmentTableProps {
  /** Itens já na ordem manual definida na Mochila. */
  items: Equipment[];
  characterName: string;
}

interface EquipmentGroup {
  group: equipGroup;
  items: Equipment[];
  spaces: number;
}

// sx em nível de módulo: a ficha pode ter dezenas de itens e cada objeto
// inline força o emotion a re-serializar o estilo.
const GROUP_HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1,
  py: 0.5,
  mt: 1,
  bgcolor: 'action.hover',
  borderRadius: 1,
} as const;

const GROUP_TITLE_SX = { fontWeight: 700, flex: 1, minWidth: 0 } as const;
const GROUP_SPACES_SX = { color: 'text.secondary', flexShrink: 0 } as const;

const HEADER_CELL_SX = {
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  letterSpacing: '0.04em',
} as const;

const ROW_SX = {
  alignItems: 'center',
  gap: 1,
  px: 1,
  py: 0.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const;

const NAME_LINE_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  flexWrap: 'wrap',
  minWidth: 0,
} as const;

/** Trilhas fixas da tabela: o nome à esquerda e "Esp." à direita. */
const NAME_COL_MIN = 140;
const NAME_COL_TRACK = `minmax(${NAME_COL_MIN}px, 2fr)`;
const SPACES_COL_MIN = 56;
const SPACES_COL_TRACK = `minmax(${SPACES_COL_MIN}px, 72px)`;
/** ROW_SX usa `gap: 1` e `px: 1` — 8px por vão, 16px de padding horizontal. */
const ROW_GAP_PX = 8;
const ROW_PADDING_PX = 16;

/**
 * Largura mínima que a tabela deste grupo ocupa. Abaixo disso a linha VAZA do
 * container, porque trilha `minmax(Npx, ...)` não encolhe abaixo de N — é esse
 * número que decide entre a tabela e os cards.
 */
export const getGroupMinWidth = (stats: EquipmentStat[]): number =>
  NAME_COL_MIN +
  stats.reduce((acc, stat) => acc + stat.minWidth, 0) +
  SPACES_COL_MIN +
  (stats.length + 1) * ROW_GAP_PX +
  ROW_PADDING_PX;

const SPACES_CELL_SX = { fontWeight: 700, textAlign: 'right' } as const;
const MUTED_CELL_SX = { color: 'text.disabled' } as const;
const INFO_ICON_SX = {
  fontSize: 15,
  color: 'text.secondary',
  cursor: 'help',
} as const;
const SUPPLEMENT_CHIP_SX = {
  height: 16,
  fontSize: '0.6rem',
  borderColor: 'info.main',
  color: 'info.main',
  '& .MuiChip-label': { px: 0.625 },
} as const;
const QTY_CHIP_SX = {
  height: 16,
  fontSize: '0.6rem',
  '& .MuiChip-label': { px: 0.625 },
} as const;
const CARD_STATS_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.5,
  mt: 0.5,
} as const;
const STAT_CHIP_SX = { height: 18, fontSize: '0.65rem' } as const;
const EMPTY_SX = { color: 'text.secondary', py: 1 } as const;

/** Munição conta unidades restantes; o resto conta quantidade. */
const getCountLabel = (item: Equipment): string | undefined => {
  if (item.isAmmo) {
    const units = item.unitsRemaining ?? 0;
    return `${units} un.`;
  }
  const quantity = item.quantity ?? 1;
  return quantity > 1 ? `×${quantity}` : undefined;
};

const EquipmentRow: React.FC<{
  item: Equipment;
  stats: ReturnType<typeof getStatsForGroup>;
  gridTemplate: string;
  compact: boolean;
  characterName: string;
}> = ({ item, stats, gridTemplate, compact, characterName }) => {
  const spaces = getItemSpaces(item);
  const countLabel = getCountLabel(item);
  const supplement = getSupplementInitials(item.supplementName);

  const nameCell = (
    <Box sx={NAME_LINE_SX}>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {item.customDisplayName || item.nome}
      </Typography>
      {countLabel && <Chip label={countLabel} size='small' sx={QTY_CHIP_SX} />}
      {supplement && (
        <Chip
          label={supplement}
          title={item.supplementName}
          size='small'
          variant='outlined'
          sx={SUPPLEMENT_CHIP_SX}
        />
      )}
      {item.descricao && (
        <Tooltip title={item.descricao} arrow>
          <InfoOutlinedIcon sx={INFO_ICON_SX} />
        </Tooltip>
      )}
      {item.rolls && item.rolls.length > 0 && (
        <RollButton
          rolls={item.rolls}
          iconOnly
          size='small'
          characterName={characterName}
        />
      )}
    </Box>
  );

  if (compact) {
    return (
      <Box sx={{ ...ROW_SX, display: 'block' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>{nameCell}</Box>
          <Typography variant='body2' sx={SPACES_CELL_SX}>
            {spaces > 0 ? spaces : '—'}
          </Typography>
        </Box>
        {stats.length > 0 && (
          <Box sx={CARD_STATS_SX}>
            {stats.map((stat) => {
              const value = stat.get(item);
              if (!value) return null;
              return (
                <Chip
                  key={stat.key}
                  label={`${stat.shortLabel} ${value}`}
                  size='small'
                  variant='outlined'
                  sx={STAT_CHIP_SX}
                />
              );
            })}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ ...ROW_SX, display: 'grid', gridTemplateColumns: gridTemplate }}>
      {nameCell}
      {stats.map((stat) => {
        const value = stat.get(item);
        return (
          <Typography
            key={stat.key}
            variant='caption'
            sx={value ? undefined : MUTED_CELL_SX}
          >
            {value ?? '—'}
          </Typography>
        );
      })}
      <Typography variant='body2' sx={SPACES_CELL_SX}>
        {spaces > 0 ? spaces : '—'}
      </Typography>
    </Box>
  );
};

const MemoRow = React.memo(EquipmentRow);

/**
 * Equipamentos da ficha em tabela, agrupados por categoria. As colunas mudam
 * conforme o tipo — armas mostram dano/crítico/tipo/alcance, defesas mostram
 * defesa/penalidade — e "Espaços" é sempre a última coluna, com subtotal por
 * categoria, porque é o número que mais importa na hora de decidir o que
 * carregar.
 */
const EquipmentTable: React.FC<EquipmentTableProps> = ({
  items,
  characterName,
}) => {
  const [containerRef, containerWidth] = useContainerWidth<HTMLDivElement>();

  // A ordem manual da Mochila é preservada DENTRO de cada categoria; as
  // categorias seguem a ordem canônica usada no resto do app.
  const groups: EquipmentGroup[] = useMemo(() => {
    const byGroup = new Map<equipGroup, Equipment[]>();
    items.forEach((item) => {
      const list = byGroup.get(item.group);
      if (list) list.push(item);
      else byGroup.set(item.group, [item]);
    });

    return CATEGORY_ORDER.filter((group) => byGroup.has(group)).map((group) => {
      const groupItems = byGroup.get(group) as Equipment[];
      return {
        group,
        items: groupItems,
        spaces: groupItems.reduce((acc, item) => acc + getItemSpaces(item), 0),
      };
    });
  }, [items]);

  // O modo é decidido pela largura REAL do container, não pelo viewport: na
  // ficha esta tabela mora numa coluna de 60%, então um iPad em pé tem ~360px
  // úteis — largura de celular, viewport de tablet. A decisão é única para a
  // aba inteira (o maior mínimo entre os grupos) para não misturar tabela e
  // cards na mesma tela.
  const requiredWidth = useMemo(
    () =>
      groups.reduce(
        (acc, { group }) =>
          Math.max(acc, getGroupMinWidth(getStatsForGroup(group))),
        0
      ),
    [groups]
  );
  // `0` = ainda não medido; assume a tabela. O layout effect mede antes do
  // paint, então esse render não chega à tela.
  const compact = containerWidth > 0 && containerWidth < requiredWidth;

  if (groups.length === 0) {
    return (
      <Typography variant='body2' sx={EMPTY_SX}>
        Nenhum equipamento na mochila.
      </Typography>
    );
  }

  return (
    // `overflowX` é a barreira de contenção: mesmo num container mais estreito
    // que os cards, o conteúdo rola aqui dentro em vez de vazar por cima da
    // coluna vizinha (o Card da ficha é `overflow: visible` de propósito).
    <Box ref={containerRef} sx={{ minWidth: 0, overflowX: 'auto' }}>
      {groups.map(({ group, items: groupItems, spaces }) => {
        const stats = getStatsForGroup(group);
        const style = itemTypeStyles[group];
        const Icon = style?.icon;
        const gridTemplate = [
          NAME_COL_TRACK,
          ...stats.map(statTrack),
          SPACES_COL_TRACK,
        ].join(' ');

        return (
          <Box key={group}>
            <Box sx={GROUP_HEADER_SX}>
              {Icon && (
                <Icon
                  sx={{ fontSize: 18 }}
                  style={{ color: style.color }}
                  aria-hidden
                />
              )}
              <Typography variant='body2' sx={GROUP_TITLE_SX}>
                {style?.label ?? group}
              </Typography>
              <Typography variant='caption' sx={GROUP_SPACES_SX}>
                {spaces} {spaces === 1 ? 'espaço' : 'espaços'}
              </Typography>
            </Box>

            {!compact && (
              <Box
                sx={{
                  ...ROW_SX,
                  display: 'grid',
                  gridTemplateColumns: gridTemplate,
                  py: 0.25,
                }}
              >
                <Typography variant='caption' sx={HEADER_CELL_SX}>
                  Item
                </Typography>
                {stats.map((stat) => (
                  <Typography
                    key={stat.key}
                    variant='caption'
                    sx={HEADER_CELL_SX}
                  >
                    {stat.label}
                  </Typography>
                ))}
                <Typography
                  variant='caption'
                  sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}
                >
                  Esp.
                </Typography>
              </Box>
            )}

            {groupItems.map((item) => (
              <MemoRow
                key={item.id ?? `${item.group}-${item.nome}`}
                item={item}
                stats={stats}
                gridTemplate={gridTemplate}
                compact={compact}
                characterName={characterName}
              />
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default EquipmentTable;
