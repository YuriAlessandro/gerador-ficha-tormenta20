import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Remove as RemoveIcon,
  ReportProblem as OverflowIcon,
} from '@mui/icons-material';

import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import { itemTypeStyles } from './itemTypeStyles';
import WieldingControl from './WieldingControl';
import WornArmorControl from './WornArmorControl';
import { isTwoHanded, WieldingSlot } from './wielding';
import { AMMO_LABELS } from './ammo';

export interface BackpackItemCardProps {
  item: Equipment;
  isOverflowing: boolean;
  reorderMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onIncrementQuantity?: () => void;
  onDecrementQuantity?: () => void;
  /** Wielding slot the item currently occupies. */
  wieldingSlot?: WieldingSlot;
  onWieldingChange?: (slot: WieldingSlot) => void;
  /**
   * Optional slot disable map (e.g. when another two-handed weapon occupies
   * both hands).
   */
  wieldingDisabledSlots?: Partial<Record<'main' | 'off', { reason: string }>>;
  /** True when this item (armor) is the one currently worn. */
  isWorn?: boolean;
  onWornChange?: (worn: boolean) => void;
  /** Adjust ammunition units remaining (positive or negative delta). */
  onAdjustAmmoUnits?: (delta: number) => void;
}

function formatEnhancementsSuffix(item: Equipment): string {
  const modNames = (item.modifications ?? []).map((m) =>
    m.mod === 'Material especial' && m.specialMaterial
      ? `Material ${m.specialMaterial}`
      : m.mod
  );
  const enchNames = (item.enchantments ?? []).map((e) => e.enchantment);
  const all = [...modNames, ...enchNames];
  if (all.length === 0) return '';
  return ` (${all.join('; ')})`;
}

function getDisplayName(item: Equipment): string {
  const base = item.customDisplayName || item.nome;
  return `${base}${formatEnhancementsSuffix(item)}`;
}

function isDefense(item: Equipment): item is DefenseEquipment {
  return item.group === 'Armadura' || item.group === 'Escudo';
}

const BackpackItemCard: React.FC<BackpackItemCardProps> = ({
  item,
  isOverflowing,
  reorderMode,
  onEdit,
  onDelete,
  onIncrementQuantity,
  onDecrementQuantity,
  wieldingSlot = null,
  onWieldingChange,
  wieldingDisabledSlots,
  isWorn = false,
  onWornChange,
  onAdjustAmmoUnits,
}) => {
  const itemTwoHanded = isTwoHanded(item);
  const style = itemTypeStyles[item.group];
  const Icon = style.icon;
  const quantity = item.quantity ?? 1;
  const unitSpaces = item.spaces ?? 0;
  const totalSpaces = unitSpaces * quantity;
  const isAmmoItem = Boolean(item.isAmmo);
  const ammoUnits = item.unitsRemaining ?? 0;
  const ammoPackSize = item.ammoPackSize ?? 20;
  const ammoLabel = item.ammoType ? AMMO_LABELS[item.ammoType] : 'Munição';

  const stats: { label: string; value: string }[] = [];
  if (item.group === 'Arma') {
    if (item.dano) stats.push({ label: 'Dano', value: item.dano });
    if (item.critico) stats.push({ label: 'Crít', value: item.critico });
    if (item.atkBonus !== undefined) {
      const sign = item.atkBonus >= 0 ? '+' : '';
      stats.push({ label: 'Atk', value: `${sign}${item.atkBonus}` });
    }
  } else if (isDefense(item)) {
    stats.push({ label: 'Def', value: `+${item.defenseBonus}` });
    if (item.armorPenalty) {
      stats.push({ label: 'Pen', value: `${item.armorPenalty}` });
    }
  }

  return (
    <Card
      variant='outlined'
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isOverflowing ? 'error.main' : undefined,
        borderWidth: isOverflowing ? 2 : 1,
        position: 'relative',
      }}
    >
      <CardContent sx={{ flex: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction='row' spacing={1} alignItems='flex-start'>
          {reorderMode && (
            <Box
              sx={{
                color: 'text.secondary',
                cursor: 'grab',
                pt: 0.25,
              }}
              aria-label='Arrastar para reordenar'
            >
              <DragIcon fontSize='small' />
            </Box>
          )}
          <Box sx={{ color: style.color, pt: 0.25 }}>
            <Icon fontSize='small' />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
                title={getDisplayName(item)}
              >
                {getDisplayName(item)}
              </Typography>
              {quantity > 1 && (
                <Chip
                  size='small'
                  label={`x${quantity}`}
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              )}
              {item.isCustom && (
                <Chip
                  size='small'
                  label='Custom'
                  variant='outlined'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {wieldingSlot === 'main' && (
                <Chip
                  size='small'
                  label='Principal'
                  color='primary'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {wieldingSlot === 'off' && (
                <Chip
                  size='small'
                  label='Secundária'
                  color='secondary'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {wieldingSlot === 'both' && (
                <Chip
                  size='small'
                  label='Duas mãos'
                  color='primary'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {itemTwoHanded && wieldingSlot !== 'both' && (
                <Chip
                  size='small'
                  label='2 mãos'
                  variant='outlined'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              {isWorn && item.group === 'Armadura' && (
                <Chip
                  size='small'
                  label='Vestida'
                  color='primary'
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Stack>

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mt: 0.25 }}
            >
              {style.label}
              {isAmmoItem
                ? ` · ${ammoLabel}: ${ammoUnits}`
                : totalSpaces > 0 && ` · ${totalSpaces} esp.`}
              {!isAmmoItem &&
                unitSpaces > 0 &&
                quantity > 1 &&
                ` (${unitSpaces} × ${quantity})`}
            </Typography>

            {stats.length > 0 && (
              <Stack
                direction='row'
                spacing={0.5}
                sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}
              >
                {stats.map((s) => (
                  <Chip
                    key={s.label}
                    size='small'
                    label={`${s.label} ${s.value}`}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            )}

            {item.descricao && item.group !== 'Arma' && !isDefense(item) && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mt: 0.5,
                }}
              >
                {item.descricao}
              </Typography>
            )}

            {isOverflowing && (
              <Stack
                direction='row'
                spacing={0.5}
                alignItems='center'
                sx={{ mt: 0.75, color: 'error.main' }}
              >
                <OverflowIcon fontSize='small' />
                <Typography variant='caption' sx={{ fontWeight: 600 }}>
                  Excede limite de carga
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack direction='column' spacing={0.25} alignItems='center'>
            {item.group === 'Armadura' && onWornChange && (
              <WornArmorControl
                item={item}
                isWorn={isWorn}
                onChange={onWornChange}
              />
            )}
            {item.group !== 'Armadura' && !isAmmoItem && onWieldingChange && (
              <WieldingControl
                item={item}
                currentSlot={wieldingSlot}
                onChange={onWieldingChange}
                disabledSlots={wieldingDisabledSlots}
              />
            )}
            {onEdit && (
              <Tooltip title='Editar item'>
                <IconButton size='small' onClick={onEdit} aria-label='Editar'>
                  <EditIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title='Excluir da mochila'>
                <IconButton
                  size='small'
                  onClick={onDelete}
                  aria-label='Excluir'
                  color='error'
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {isAmmoItem && onAdjustAmmoUnits && (
          <Stack
            direction='row'
            spacing={0.25}
            alignItems='center'
            justifyContent='flex-end'
            sx={{ mt: 1 }}
          >
            <Tooltip title={`Reabastecer ${ammoPackSize}`}>
              <IconButton
                size='small'
                onClick={() => onAdjustAmmoUnits(ammoPackSize)}
                aria-label='Reabastecer pacote'
              >
                <Typography
                  variant='caption'
                  sx={{ fontWeight: 700, lineHeight: 1 }}
                >
                  +{ammoPackSize}
                </Typography>
              </IconButton>
            </Tooltip>
            <IconButton
              size='small'
              onClick={() => onAdjustAmmoUnits(-1)}
              disabled={ammoUnits <= 0}
              aria-label='Diminuir munição'
            >
              <RemoveIcon fontSize='small' />
            </IconButton>
            <Typography
              variant='caption'
              sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}
            >
              {ammoUnits}
            </Typography>
            <IconButton
              size='small'
              onClick={() => onAdjustAmmoUnits(1)}
              aria-label='Aumentar munição'
            >
              <AddIcon fontSize='small' />
            </IconButton>
          </Stack>
        )}
        {!isAmmoItem && (onIncrementQuantity || onDecrementQuantity) && (
          <Stack
            direction='row'
            spacing={0.25}
            alignItems='center'
            justifyContent='flex-end'
            sx={{ mt: 1 }}
          >
            <IconButton
              size='small'
              onClick={onDecrementQuantity}
              disabled={!onDecrementQuantity || quantity <= 1}
              aria-label='Diminuir quantidade'
            >
              <RemoveIcon fontSize='small' />
            </IconButton>
            <Typography
              variant='caption'
              sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}
            >
              {quantity}
            </Typography>
            <IconButton
              size='small'
              onClick={onIncrementQuantity}
              disabled={!onIncrementQuantity}
              aria-label='Aumentar quantidade'
            >
              <AddIcon fontSize='small' />
            </IconButton>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(BackpackItemCard);
