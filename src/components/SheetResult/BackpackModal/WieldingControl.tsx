import React, { useState } from 'react';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { BackHand as HandIcon, Check as CheckIcon } from '@mui/icons-material';

import Equipment from '../../../interfaces/Equipment';
import {
  isTwoHanded as defaultIsTwoHanded,
  isWieldable as defaultIsWieldable,
  WieldingSlot,
} from './wielding';

export interface WieldingControlProps {
  item: Equipment;
  currentSlot: WieldingSlot;
  onChange: (slot: WieldingSlot) => void;
  /** Render at small size (used inside cards). */
  size?: 'small' | 'medium';
  /** Override of the default wieldability check (e.g. to expose more types). */
  isWieldable?: (item: Equipment) => boolean;
  /**
   * Slot-specific disable + tooltip. Used when the other hand (or both) is
   * already occupied by a two-handed weapon belonging to a different item.
   */
  disabledSlots?: Partial<Record<'main' | 'off', { reason: string }>>;
}

const SLOT_LABELS: Record<'main' | 'off', string> = {
  main: 'Mão Principal',
  off: 'Mão Secundária',
};

function buttonColor(slot: WieldingSlot): 'inherit' | 'primary' | 'secondary' {
  if (slot === 'main' || slot === 'both') return 'primary';
  if (slot === 'off') return 'secondary';
  return 'inherit';
}

function tooltipFor(slot: WieldingSlot): string {
  if (slot === 'both')
    return 'Empunhada em duas mãos. Clique para soltar ou mudar.';
  if (slot === 'main') return 'Empunhada (Mão Principal). Clique para mudar.';
  if (slot === 'off') return 'Empunhada (Mão Secundária). Clique para mudar.';
  return 'Não empunhado. Clique para empunhar.';
}

const WieldingControl: React.FC<WieldingControlProps> = ({
  item,
  currentSlot,
  onChange,
  size = 'small',
  isWieldable = defaultIsWieldable,
  disabledSlots,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!isWieldable(item)) return null;

  const open = Boolean(anchorEl);
  const twoHanded = defaultIsTwoHanded(item);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (slot: WieldingSlot) => {
    onChange(slot);
    handleClose();
  };

  const renderHandSlot = (slot: 'main' | 'off') => {
    const selected = currentSlot === slot;
    const disabled = disabledSlots?.[slot];
    const itemRow = (
      <MenuItem
        key={slot}
        selected={selected}
        disabled={Boolean(disabled)}
        onClick={() => handleSelect(slot)}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>
          {selected ? <CheckIcon fontSize='small' /> : null}
        </ListItemIcon>
        <ListItemText primary={SLOT_LABELS[slot]} />
      </MenuItem>
    );
    if (disabled) {
      return (
        <Tooltip key={slot} title={disabled.reason} placement='left'>
          <span>{itemRow}</span>
        </Tooltip>
      );
    }
    return itemRow;
  };

  return (
    <>
      <Tooltip title={tooltipFor(currentSlot)}>
        <IconButton
          size={size}
          color={buttonColor(currentSlot)}
          onClick={handleOpen}
          aria-label='Definir empunhadura'
        >
          <HandIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {twoHanded ? (
          <MenuItem
            selected={currentSlot === 'both'}
            onClick={() => handleSelect('both')}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {currentSlot === 'both' ? <CheckIcon fontSize='small' /> : null}
            </ListItemIcon>
            <ListItemText primary='Empunhar (ocupa as duas mãos)' />
          </MenuItem>
        ) : (
          <>
            {renderHandSlot('main')}
            {renderHandSlot('off')}
          </>
        )}
        <MenuItem
          selected={currentSlot === null}
          onClick={() => handleSelect(null)}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            {currentSlot === null ? <CheckIcon fontSize='small' /> : null}
          </ListItemIcon>
          <ListItemText primary='Não empunhar' />
        </MenuItem>
      </Menu>
    </>
  );
};

export default WieldingControl;
