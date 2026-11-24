import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import { itemTypeStyles } from './itemTypeStyles';

export interface ItemCatalogCardProps {
  item: Equipment;
  onAdd: (item: Equipment, quantity: number) => void;
  cantAfford?: boolean;
  supplementLabel?: string;
  addLabel?: string;
}

function isDefense(item: Equipment): item is DefenseEquipment {
  return item.group === 'Armadura' || item.group === 'Escudo';
}

/** Itens que fazem sentido com controle de quantidade ao adicionar. */
function allowsQuantity(item: Equipment): boolean {
  return !!(
    item.isAmmo ||
    item.group === 'Alquimía' ||
    item.group === 'Alimentação' ||
    item.group === 'Item Geral'
  );
}

// ─── SX constants ──────────────────────────────────────────────────────────

const CARD_SX = {
  display: 'flex',
  flexDirection: 'column' as const,
  p: 1.5,
  borderRadius: 1.5,
  gap: 0.75,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 150px',
} as const;

const HEADER_SX = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 0.75,
  minWidth: 0,
} as const;

const STATS_SX = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 0.5,
} as const;

const FOOTER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  mt: 'auto' as const,
  pt: 0.5,
} as const;

const STAT_CHIP_SX = {
  height: 18,
  fontSize: '0.65rem',
  '& .MuiChip-label': { px: 0.75 },
} as const;

const SUPP_CHIP_SX = {
  height: 16,
  fontSize: '0.6rem',
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.625 },
} as const;

const QTY_BTN_SX = { p: 0.25 } as const;
const QTY_VAL_SX = { minWidth: 20, textAlign: 'center' as const } as const;

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Card de catálogo de item para o diálogo "Adicionar à mochila".
 * Exibe stats relevantes (dano/crítico para armas; bônus/penalidade para
 * armaduras), descrição quando disponível, controle de quantidade e botão
 * de adicionar.
 */
const ItemCatalogCard: React.FC<ItemCatalogCardProps> = ({
  item,
  onAdd,
  cantAfford = false,
  supplementLabel,
  addLabel = 'Adicionar',
}) => {
  const [quantity, setQuantity] = useState(1);
  const style = itemTypeStyles[item.group];
  const Icon = style?.icon;
  const isWeapon = item.group === 'Arma';
  const hasQty = allowsQuantity(item);
  const def = isDefense(item) ? (item as DefenseEquipment) : null;

  const handleAdd = () => onAdd(item, hasQty ? quantity : 1);

  return (
    <Paper component='article' variant='outlined' sx={CARD_SX}>
      {/* Cabeçalho: ícone + nome + chip de suplemento */}
      <Box sx={HEADER_SX}>
        {Icon && (
          <Icon
            style={{ fontSize: 16, color: style.color, flexShrink: 0, marginTop: 2 }}
            aria-hidden
          />
        )}
        <Typography
          component='h4'
          variant='body2'
          sx={{ fontWeight: 600, flex: 1, lineHeight: 1.3, minWidth: 0 }}
        >
          {item.nome}
        </Typography>
        {supplementLabel && (
          <Chip
            size='small'
            label={supplementLabel}
            variant='outlined'
            color='info'
            sx={SUPP_CHIP_SX}
          />
        )}
      </Box>

      {/* Chips de stats */}
      <Box sx={STATS_SX}>
        {isWeapon && item.dano && item.dano !== '-' && (
          <Chip size='small' label={item.dano} title='Dano' sx={STAT_CHIP_SX} />
        )}
        {isWeapon && item.critico && item.critico !== '-' && (
          <Chip size='small' label={`Crit ${item.critico}`} sx={STAT_CHIP_SX} />
        )}
        {isWeapon && item.tipo && item.tipo !== '-' && (
          <Chip size='small' label={item.tipo} sx={STAT_CHIP_SX} />
        )}
        {isWeapon && item.alcance && item.alcance !== '-' && (
          <Chip size='small' label={item.alcance} sx={STAT_CHIP_SX} />
        )}
        {def !== null && def.defenseBonus !== undefined && (
          <Chip
            size='small'
            label={`+${def.defenseBonus} Def`}
            color='info'
            sx={STAT_CHIP_SX}
          />
        )}
        {def !== null &&
          def.armorPenalty !== undefined &&
          def.armorPenalty !== 0 && (
            <Chip
              size='small'
              label={`Pen ${def.armorPenalty}`}
              color='warning'
              sx={STAT_CHIP_SX}
            />
          )}
        {item.preco !== undefined && (
          <Chip size='small' label={`T$ ${item.preco}`} sx={STAT_CHIP_SX} />
        )}
        {item.spaces !== undefined && item.spaces > 0 && (
          <Chip size='small' label={`${item.spaces} esp.`} sx={STAT_CHIP_SX} />
        )}
        {cantAfford && (
          <Chip
            size='small'
            label='Saldo insuficiente'
            color='warning'
            sx={STAT_CHIP_SX}
          />
        )}
      </Box>

      {/* Descrição */}
      {item.descricao && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ lineHeight: 1.4 }}
        >
          {item.descricao}
        </Typography>
      )}

      {/* Rodapé: controle de quantidade + botão adicionar */}
      <Box sx={FOOTER_SX}>
        {hasQty && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <IconButton
              size='small'
              sx={QTY_BTN_SX}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label={`Diminuir quantidade de ${item.nome}`}
            >
              <RemoveIcon fontSize='inherit' />
            </IconButton>
            <Typography variant='caption' sx={QTY_VAL_SX}>
              {quantity}
            </Typography>
            <IconButton
              size='small'
              sx={QTY_BTN_SX}
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label={`Aumentar quantidade de ${item.nome}`}
            >
              <AddIcon fontSize='inherit' />
            </IconButton>
          </Box>
        )}
        <Box sx={{ flex: 1 }} />
        <Tooltip
          title={
            cantAfford
              ? 'Saldo insuficiente — desative "Auto-descontar T$" para adicionar mesmo assim.'
              : addLabel
          }
        >
          <span>
            <IconButton
              color='primary'
              size='small'
              onClick={handleAdd}
              disabled={cantAfford}
              aria-label={`Adicionar ${item.nome}`}
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ItemCatalogCard;
