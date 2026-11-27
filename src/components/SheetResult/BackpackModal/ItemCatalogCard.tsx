import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import { itemTypeStyles } from './itemTypeStyles';
import { resolveItemPresentation } from './itemEffects';

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

/** Renderiza `**destaque**` sem HTML cru. */
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, idx) => {
    const key = `${idx}-${part.slice(0, 10)}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

// ─── SX constants ──────────────────────────────────────────────────────────

const CARD_SX = {
  display: 'flex',
  flexDirection: 'column' as const,
  p: 2,
  borderRadius: 2,
  gap: 1,
  minWidth: 0,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 110px',
} as const;

const HEADER_SX = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
  minWidth: 0,
} as const;

const TITLE_SX = {
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.3,
  flex: 1,
  minWidth: 0,
  color: 'text.primary',
  textWrap: 'balance',
  overflowWrap: 'break-word',
} as const;

const STATS_SX = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 0.625,
} as const;

const FOOTER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mt: 'auto' as const,
  pt: 0.75,
} as const;

/**
 * Sem `height` fixo (WCAG 1.4.12): `minBlockSize` + padding garantem legibilidade
 * mesmo quando o usuário aumenta o espaçamento/zoom de fonte no navegador.
 */
const STAT_CHIP_SX = {
  height: 'auto',
  minBlockSize: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  '& .MuiChip-label': { px: 1, py: 0.25 },
} as const;

const SUPP_CHIP_SX = {
  height: 'auto',
  minBlockSize: 22,
  fontSize: '0.72rem',
  fontWeight: 600,
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.875, py: 0.125 },
} as const;

const LORE_TEXT_SX = {
  fontSize: '0.875rem',
  lineHeight: 1.55,
  color: 'text.secondary',
  textWrap: 'pretty',
  overflowWrap: 'break-word',
} as const;

const EFFECT_LABEL_SX = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  mb: 0.25,
} as const;

const EFFECT_TEXT_SX = {
  fontSize: '0.875rem',
  lineHeight: 1.55,
  color: 'text.primary',
  textWrap: 'pretty',
  overflowWrap: 'break-word',
} as const;

const QTY_BTN_SX = { p: 0.5 } as const;
const QTY_VAL_SX = {
  minWidth: 24,
  textAlign: 'center' as const,
  fontSize: '0.875rem',
  fontWeight: 600,
} as const;

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Card de catálogo de item para o diálogo "Adicionar à mochila".
 * Exibe stats legíveis, separa descrição narrativa (lore) do bloco de efeito
 * mecânico, resume bônus/traços estruturados e traz controle de quantidade.
 */
const ItemCatalogCard: React.FC<ItemCatalogCardProps> = ({
  item,
  onAdd,
  cantAfford = false,
  supplementLabel,
  addLabel = 'Adicionar',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [quantity, setQuantity] = useState(1);
  const style = itemTypeStyles[item.group];
  const Icon = style?.icon;
  const isWeapon = item.group === 'Arma';
  const hasQty = allowsQuantity(item);
  const def = isDefense(item) ? (item as DefenseEquipment) : null;
  const { lore, effectText, effectBadges } = resolveItemPresentation(item);

  const handleAdd = () => onAdd(item, hasQty ? quantity : 1);

  return (
    <Paper component='article' variant='outlined' sx={CARD_SX}>
      {/* Cabeçalho: ícone + nome + chip de suplemento */}
      <Box sx={HEADER_SX}>
        {Icon && (
          <Icon
            style={{ fontSize: 18, color: style.color, flexShrink: 0, marginTop: 2 }}
            aria-hidden
          />
        )}
        <Typography component='h4' variant='subtitle2' sx={TITLE_SX}>
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

      {/* Chips de stats + traços mecânicos */}
      <Box sx={STATS_SX}>
        {isWeapon && item.dano && item.dano !== '-' && (
          <Chip
            size='small'
            label={`Dano ${item.dano}`}
            title='Dano'
            sx={STAT_CHIP_SX}
          />
        )}
        {isWeapon && item.critico && item.critico !== '-' && (
          <Chip size='small' label={`Crít ${item.critico}`} sx={STAT_CHIP_SX} />
        )}
        {isWeapon && item.tipo && item.tipo !== '-' && (
          <Chip size='small' label={item.tipo} sx={STAT_CHIP_SX} />
        )}
        {isWeapon && item.alcance && item.alcance !== '-' && (
          <Chip size='small' label={`Alcance ${item.alcance}`} sx={STAT_CHIP_SX} />
        )}
        {def !== null && def.defenseBonus !== undefined && (
          <Chip
            size='small'
            label={`+${def.defenseBonus} Defesa`}
            color='info'
            sx={STAT_CHIP_SX}
          />
        )}
        {def !== null &&
          def.armorPenalty !== undefined &&
          def.armorPenalty !== 0 && (
            <Chip
              size='small'
              label={`Penalidade ${def.armorPenalty}`}
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
        {effectBadges.map((badge) => (
          <Chip
            key={badge}
            size='small'
            label={badge}
            variant='outlined'
            sx={STAT_CHIP_SX}
          />
        ))}
        {cantAfford && (
          <Chip
            size='small'
            label='Saldo insuficiente'
            color='warning'
            sx={STAT_CHIP_SX}
          />
        )}
      </Box>

      {/* Lore / descrição narrativa (quando separada do efeito) */}
      {lore && (
        <Typography variant='body2' sx={LORE_TEXT_SX}>
          {renderInlineBold(lore)}
        </Typography>
      )}

      {/* Bloco destacado de Efeito mecânico */}
      {effectText && (
        <Box
          sx={{
            borderInlineStart: '3px solid',
            borderColor: 'primary.main',
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.035)',
            borderRadius: 1,
            px: 1.25,
            py: 0.75,
          }}
        >
          <Typography
            component='span'
            sx={{
              ...EFFECT_LABEL_SX,
              color: isDark ? '#ff9e9f' : 'primary.dark',
            }}
          >
            Efeito
          </Typography>
          <Typography variant='body2' sx={EFFECT_TEXT_SX}>
            {renderInlineBold(effectText)}
          </Typography>
        </Box>
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
              <RemoveIcon fontSize='small' />
            </IconButton>
            <Typography variant='body2' sx={QTY_VAL_SX}>
              {quantity}
            </Typography>
            <IconButton
              size='small'
              sx={QTY_BTN_SX}
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label={`Aumentar quantidade de ${item.nome}`}
            >
              <AddIcon fontSize='small' />
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
            <Button
              variant='outlined'
              color='primary'
              size='small'
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={cantAfford}
              aria-label={`Adicionar ${item.nome}`}
            >
              Adicionar
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ItemCatalogCard;
