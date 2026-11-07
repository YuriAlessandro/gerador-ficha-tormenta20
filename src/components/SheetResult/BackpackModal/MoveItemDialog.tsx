import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/DirectionsWalk';
import LuggageIcon from '@mui/icons-material/Luggage';
import StashIcon from '@mui/icons-material/HomeWork';

import NumberField from '@/components/common/NumberField';
import Equipment from '../../../interfaces/Equipment';
import { getItemSpaces } from '../../../interfaces/Bag';
import {
  getContainerIds,
  isContainer,
  resolveLocation,
  STASH_LOCATION,
  StorageLocationUsage,
} from '../../../functions/bagStorage';

export interface MoveItemDialogProps {
  open: boolean;
  item: Equipment | null;
  /** Todos os itens da mochila (para resolver o local atual). */
  items: Equipment[];
  storage: StorageLocationUsage[];
  carriedSpaces: number;
  maxSpaces: number;
  onClose: () => void;
  onMove: (location: string | undefined, units?: number) => void;
}

/** Unidades da pilha: rodadas de munição, itens no resto. */
function stackUnits(item: Equipment): number {
  return item.isAmmo ? item.unitsRemaining ?? 0 : item.quantity ?? 1;
}

/**
 * Escolha do destino de um item: com você, um recipiente (Alforje, Carroça…)
 * ou guardado. Pilha com mais de uma unidade pergunta quantas mover. Cada
 * destino mostra a ocupação — inclusive quanto ficaria depois de mover — para
 * o jogador não precisar fazer conta; passar do limite só avisa (a regra não
 * define penalidade para montaria ou veículo sobrecarregado).
 */
const MoveItemDialog: React.FC<MoveItemDialogProps> = ({
  open,
  item,
  items,
  storage,
  carriedSpaces,
  maxSpaces,
  onClose,
  onMove,
}) => {
  const total = item ? stackUnits(item) : 1;
  const [units, setUnits] = useState<number>(total);

  useEffect(() => {
    if (open) setUnits(total);
  }, [open, item?.id, total]);

  if (!item) return null;

  const current = resolveLocation(item, getContainerIds(items));
  const itemIsContainer = isContainer(item);
  const moving = Math.max(1, Math.min(total, units || 1));
  // Espaço da parte movida, pela mesma conta do total (munição inclusive).
  const movingSpaces =
    total > 0 ? getItemSpaces(item) * (moving / Math.max(total, 1)) : 0;
  const fmt = (n: number) => Number(n.toFixed(1)).toString();

  const destinations: {
    location: string | undefined;
    label: string;
    secondary: string;
    over: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      location: undefined,
      label: 'Com você',
      secondary: `${fmt(carriedSpaces)}/${maxSpaces} espaços`,
      over: carriedSpaces + movingSpaces > maxSpaces,
      icon: <PersonIcon />,
    },
  ];
  if (!itemIsContainer) {
    storage
      .filter((loc) => loc.container)
      .forEach((loc) => {
        destinations.push({
          location: loc.location,
          label: loc.label,
          secondary: `${fmt(loc.used)}/${loc.capacity} espaços`,
          over:
            loc.capacity !== undefined &&
            loc.used + movingSpaces > loc.capacity,
          icon: <LuggageIcon />,
        });
      });
  }
  const stash = storage.find((loc) => loc.location === STASH_LOCATION);
  destinations.push({
    location: STASH_LOCATION,
    label: 'Guardado',
    secondary: itemIsContainer
      ? 'Fora da aventura, com o que estiver dentro'
      : `Fora da aventura (estalagem, casa)${
          stash ? ` · ${fmt(stash.used)} espaços` : ''
        }`,
    over: false,
    icon: <StashIcon />,
  });

  const name = item.customDisplayName || item.nome;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ pb: 1 }}>Mover {name}</DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {total > 1 && (
          <Box sx={{ mb: 1.5, mt: 1 }}>
            <NumberField
              label={item.isAmmo ? 'Unidades' : 'Quantidade'}
              size='small'
              value={units}
              min={1}
              max={total}
              onValueChange={(v) => setUnits(v ?? 1)}
              helperText={`de ${total}`}
              fullWidth
            />
          </Box>
        )}
        <List dense disablePadding>
          {destinations.map((dest) => {
            const isCurrent = dest.location === current;
            return (
              <ListItemButton
                key={dest.location ?? 'carried'}
                disabled={isCurrent}
                selected={isCurrent}
                onClick={() =>
                  onMove(dest.location, moving < total ? moving : undefined)
                }
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{dest.icon}</ListItemIcon>
                <ListItemText
                  primary={isCurrent ? `${dest.label} (atual)` : dest.label}
                  secondary={
                    <Typography
                      variant='caption'
                      component='span'
                      sx={{
                        color: dest.over ? 'warning.main' : 'text.secondary',
                      }}
                    >
                      {dest.secondary}
                      {dest.over && !isCurrent ? ' · vai passar do limite' : ''}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
        {itemIsContainer && (
          <Typography
            variant='caption'
            sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
          >
            Recipientes não vão dentro de outros recipientes.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveItemDialog;
