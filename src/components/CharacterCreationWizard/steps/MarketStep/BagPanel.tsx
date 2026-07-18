import React, { useMemo } from 'react';
import { Box, Typography, IconButton, Chip, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '@/interfaces/Equipment';
import { formatPrice } from '@/functions/equipmentDisplay';
import { BAG_CATEGORY_LABELS } from './marketCategories';

interface BagStack {
  /** Ids de todas as entradas agrupadas nesta linha. */
  ids: string[];
  item: Equipment | DefenseEquipment;
  quantity: number;
  /** Preço somado apenas das entradas efetivamente pagas. */
  refundable: number;
}

interface BagPanelProps {
  bagEquipments: BagEquipments;
  purchasedIds: string[];
  bagSpaces: number;
  onRemove: (ids: string[]) => void;
}

const EMPTY_SX = { color: 'text.secondary' } as const;
const GROUP_LABEL_SX = {
  display: 'block',
  color: 'text.secondary',
  mt: 1.5,
  mb: 0.5,
} as const;
const ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  py: 0.5,
  px: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const;
const ROW_META_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  flexShrink: 0,
} as const;
const QTY_CHIP_SX = { height: 18, fontSize: '0.65rem', ml: 0.75 } as const;

/**
 * Agrupa entradas idênticas da mochila numa linha só. Comprar 20 flechas gera
 * 20 entradas com ids distintos; mostrá-las uma a uma tornava o painel
 * ilegível.
 */
const stackItems = (
  items: (Equipment | DefenseEquipment)[],
  purchasedIds: string[]
): BagStack[] => {
  const purchased = new Set(purchasedIds);
  const stacks = new Map<string, BagStack>();

  items.forEach((item) => {
    if (!item) return;
    const key = `${item.supplementId ?? 'core'}::${item.nome}`;
    const quantity = item.quantity ?? 1;
    const paid =
      item.id && purchased.has(item.id) ? (item.preco ?? 0) * quantity : 0;
    const existing = stacks.get(key);

    if (existing) {
      existing.quantity += quantity;
      existing.refundable += paid;
      if (item.id) existing.ids.push(item.id);
    } else {
      stacks.set(key, {
        ids: item.id ? [item.id] : [],
        item,
        quantity,
        refundable: paid,
      });
    }
  });

  return [...stacks.values()];
};

const BagPanel: React.FC<BagPanelProps> = ({
  bagEquipments,
  purchasedIds,
  bagSpaces,
  onRemove,
}) => {
  const groups = useMemo(
    () =>
      (
        Object.entries(bagEquipments) as [
          keyof BagEquipments,
          (Equipment | DefenseEquipment)[]
        ][]
      )
        .filter(([, items]) => items && items.length > 0)
        .map(([category, items]) => ({
          category,
          stacks: stackItems(items, purchasedIds),
        })),
    [bagEquipments, purchasedIds]
  );

  const totalItems = useMemo(
    () =>
      groups.reduce(
        (acc, group) =>
          acc + group.stacks.reduce((sum, stack) => sum + stack.quantity, 0),
        0
      ),
    [groups]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant='subtitle2'>Mochila</Typography>
        <Chip label={`${totalItems} itens`} size='small' />
        <Chip label={`${bagSpaces} espaços`} size='small' />
      </Box>

      {groups.length === 0 && (
        <Typography variant='body2' sx={EMPTY_SX}>
          Nenhum item na mochila ainda.
        </Typography>
      )}

      {groups.map((group, index) => (
        <Box key={group.category}>
          {index > 0 && <Divider />}
          <Typography variant='caption' sx={GROUP_LABEL_SX}>
            {BAG_CATEGORY_LABELS[group.category] || group.category}
          </Typography>
          {group.stacks.map((stack) => (
            <Box key={stack.ids.join('|') || stack.item.nome} sx={ROW_SX}>
              <Typography variant='body2' noWrap>
                {stack.item.nome}
                {stack.quantity > 1 && (
                  <Chip
                    label={`×${stack.quantity}`}
                    size='small'
                    sx={QTY_CHIP_SX}
                  />
                )}
              </Typography>
              <Box sx={ROW_META_SX}>
                {stack.refundable > 0 && (
                  <Typography variant='caption' color='text.secondary'>
                    {formatPrice(stack.refundable)}
                  </Typography>
                )}
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => onRemove(stack.ids)}
                  disabled={stack.ids.length === 0}
                  aria-label={`Remover ${stack.item.nome}`}
                  title={
                    stack.refundable > 0
                      ? 'Remover (reembolsa o valor pago)'
                      : 'Remover'
                  }
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(BagPanel);
