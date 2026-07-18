import React, { useMemo, useState } from 'react';
import { Box, Typography, Chip, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import {
  formatPrice,
  getSupplementInitials,
} from '@/functions/equipmentDisplay';
import { itemTypeStyles } from '@/components/SheetResult/BackpackModal/itemTypeStyles';
import { MarketCategoryDescriptor } from './marketCategories';

interface MarketItemRowProps {
  item: Equipment | DefenseEquipment;
  descriptor: MarketCategoryDescriptor;
  gridTemplate: string;
  /** Já calculado pelo pai: passar o dinheiro faria toda linha re-renderizar a cada compra. */
  affordable: boolean;
  justAdded: boolean;
  /** `false` só quando a checagem se aplica e falhou (armas/armaduras). */
  proficient: boolean;
  /** Mostra o ícone da categoria — usado na busca global, que mistura categorias. */
  showCategoryIcon: boolean;
  compact: boolean;
  onAdd: (item: Equipment | DefenseEquipment, quantity: number) => void;
}

// sx em nível de módulo: objetos inline criam identidade nova a cada render e
// forçam o emotion a re-serializar o estilo — caro vezes ~100 linhas.
const NAME_SX = { fontWeight: 500, lineHeight: 1.3 } as const;
const DESCRIPTION_SX = {
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  color: 'text.secondary',
  mt: 0.25,
} as const;
// Chips compactos: o modal do wizard é estreito, e rótulos longos com margem
// própria empurravam os selos para duas ou três linhas por item.
const BADGE_SX = {
  height: 16,
  fontSize: '0.6rem',
  '& .MuiChip-label': { px: 0.625 },
} as const;
const SUPPLEMENT_SX = {
  ...BADGE_SX,
  borderColor: 'info.main',
  color: 'info.main',
} as const;
const WARNING_SX = {
  ...BADGE_SX,
  borderColor: 'warning.main',
  color: 'warning.main',
} as const;
const BADGE_ROW_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 0.5,
  mt: 0.25,
} as const;
const STAT_CHIP_SX = { height: 20, fontSize: '0.7rem' } as const;
const QTY_BUTTON_SX = { p: 0.25 } as const;
const QTY_VALUE_SX = { minWidth: 20, textAlign: 'center' } as const;
const CARD_SX = {
  p: 1.25,
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const;
const CARD_STATS_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.5,
  mt: 0.75,
} as const;
const CARD_FOOTER_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  mt: 1,
} as const;
const QTY_BOX_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
} as const;
const ACTIONS_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 0.5,
} as const;
const CATEGORY_ICON_SX = { fontSize: 16, flexShrink: 0 } as const;
const NAME_LINE_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  minWidth: 0,
} as const;

const MAX_QUANTITY = 99;

const MarketItemRow: React.FC<MarketItemRowProps> = ({
  item,
  descriptor,
  gridTemplate,
  affordable,
  justAdded,
  proficient,
  showCategoryIcon,
  compact,
  onAdd,
}) => {
  const [quantity, setQuantity] = useState(1);
  const allowsQuantity = descriptor.allowsQuantity(item);
  const price = item.preco ?? 0;
  const totalPrice = price * (allowsQuantity ? quantity : 1);
  const disabled = !affordable;

  const CategoryIcon = itemTypeStyles[item.group]?.icon;
  const categoryColor = itemTypeStyles[item.group]?.color;

  const badges = useMemo(
    () => descriptor.badges.filter((badge) => badge.test(item)),
    [descriptor, item]
  );

  const supplementInitials = getSupplementInitials(item.supplementName);

  // `title` nativo em vez de <Tooltip>: o selo aparece em dezenas de linhas ao
  // mesmo tempo e cada Tooltip carrega um Popper — foi justamente esse tipo de
  // custo por linha que travava este passo.
  const proficiencyHint =
    item.group === 'Arma'
      ? 'Sem proficiência: −5 nos testes de ataque com esta arma'
      : 'Sem proficiência: penalidade de armadura em testes de Força e Destreza';

  const rowSx = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      alignItems: 'center',
      gap: 1,
      py: 0.75,
      px: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      opacity: disabled ? 0.55 : 1,
    }),
    [gridTemplate, disabled]
  );

  const handleAdd = () => onAdd(item, allowsQuantity ? quantity : 1);

  const addButton = (
    <Button
      size='small'
      variant={justAdded ? 'contained' : 'outlined'}
      color={justAdded ? 'success' : 'primary'}
      startIcon={justAdded ? <CheckIcon /> : <AddIcon />}
      onClick={handleAdd}
      disabled={disabled}
      title={disabled ? 'Dinheiro insuficiente' : undefined}
    >
      {justAdded ? 'Na mochila' : 'Adicionar'}
    </Button>
  );

  const quantityPicker = allowsQuantity ? (
    <Box sx={QTY_BOX_SX}>
      <IconButton
        size='small'
        sx={QTY_BUTTON_SX}
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={quantity <= 1}
        aria-label={`Diminuir quantidade de ${item.nome}`}
      >
        <RemoveIcon fontSize='inherit' />
      </IconButton>
      <Typography variant='caption' sx={QTY_VALUE_SX}>
        {quantity}
      </Typography>
      <IconButton
        size='small'
        sx={QTY_BUTTON_SX}
        onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
        disabled={quantity >= MAX_QUANTITY}
        aria-label={`Aumentar quantidade de ${item.nome}`}
      >
        <AddIcon fontSize='inherit' />
      </IconButton>
    </Box>
  ) : null;

  const nameBlock = (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={NAME_LINE_SX}>
        {showCategoryIcon && CategoryIcon && (
          <CategoryIcon
            sx={CATEGORY_ICON_SX}
            style={{ color: categoryColor }}
          />
        )}
        <Typography variant='body2' sx={NAME_SX} noWrap={!compact}>
          {item.nome}
        </Typography>
      </Box>
      {(badges.length > 0 || item.supplementName || !proficient) && (
        <Box sx={BADGE_ROW_SX}>
          {badges.map((badge) => (
            <Chip
              key={badge.key}
              label={badge.label}
              size='small'
              variant='outlined'
              sx={BADGE_SX}
            />
          ))}
          {supplementInitials && (
            <Chip
              label={supplementInitials}
              title={item.supplementName}
              size='small'
              variant='outlined'
              sx={SUPPLEMENT_SX}
            />
          )}
          {!proficient && (
            <Chip
              label='S/P'
              title={proficiencyHint}
              size='small'
              variant='outlined'
              sx={WARNING_SX}
            />
          )}
        </Box>
      )}
      {descriptor.showDescription && item.descricao && (
        <Typography variant='caption' sx={DESCRIPTION_SX}>
          {item.descricao}
        </Typography>
      )}
    </Box>
  );

  if (compact) {
    return (
      <Box sx={CARD_SX}>
        {nameBlock}
        <Box sx={CARD_STATS_SX}>
          {descriptor.stats.map((stat) => {
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
        <Box sx={CARD_FOOTER_SX}>
          <Typography
            variant='body2'
            color={totalPrice === 0 ? 'success.main' : 'text.primary'}
          >
            {formatPrice(totalPrice)}
          </Typography>
          <Box sx={ACTIONS_SX}>
            {quantityPicker}
            {addButton}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={rowSx}>
      {nameBlock}
      {descriptor.stats.map((stat) => {
        const value = stat.get(item);
        return (
          <Typography
            key={stat.key}
            variant='caption'
            sx={{
              textAlign: stat.align ?? 'left',
              color: value ? 'text.primary' : 'text.disabled',
            }}
          >
            {value ?? '—'}
          </Typography>
        );
      })}
      <Typography
        variant='caption'
        sx={{
          textAlign: 'right',
          color: totalPrice === 0 ? 'success.main' : 'text.primary',
        }}
      >
        {formatPrice(totalPrice)}
      </Typography>
      <Box sx={ACTIONS_SX}>
        {quantityPicker}
        {addButton}
      </Box>
    </Box>
  );
};

export default React.memo(MarketItemRow);
