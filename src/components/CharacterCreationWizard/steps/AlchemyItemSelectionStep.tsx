import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Equipment from '@/interfaces/Equipment';

interface AlchemyItemSelectionStepProps {
  availableItems: Equipment[];
  selectedItems: Equipment[];
  onChange: (items: Equipment[]) => void;
  budget: number;
  maxItems: number;
}

const AlchemyItemSelectionStep: React.FC<AlchemyItemSelectionStepProps> = ({
  availableItems,
  selectedItems,
  onChange,
  budget,
  maxItems,
}) => {
  const totalCount = selectedItems.length;
  const totalCost = selectedItems.reduce(
    (sum, item) => sum + (item.preco || 0),
    0
  );
  const remainingBudget = budget - totalCost;
  const remainingSlots = maxItems - totalCount;
  const isComplete = totalCount === maxItems && totalCost <= budget;

  // Count how many of each item is selected
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedItems.forEach((item) => {
      counts[item.nome] = (counts[item.nome] || 0) + 1;
    });
    return counts;
  }, [selectedItems]);

  // Sort available items by price
  const sortedItems = useMemo(
    () =>
      [...availableItems]
        .filter((item) => item.preco !== undefined)
        .sort((a, b) => (a.preco || 0) - (b.preco || 0)),
    [availableItems]
  );

  const handleAdd = (item: Equipment) => {
    if (totalCount >= maxItems) return;
    if ((item.preco || 0) > remainingBudget) return;
    onChange([...selectedItems, item]);
  };

  const handleRemove = (item: Equipment) => {
    const idx = selectedItems.findIndex((i) => i.nome === item.nome);
    if (idx === -1) return;
    const newItems = [...selectedItems];
    newItems.splice(idx, 1);
    onChange(newItems);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='body1' color='text.secondary'>
        A habilidade <strong>Laboratório Pessoal</strong> concede instrumentos
        de alquimista aprimorados e {maxItems} itens alquímicos com preço total
        de até T$ {budget}. Selecione seus itens abaixo.
      </Typography>

      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        <Chip
          label={`${totalCount}/${maxItems} itens`}
          color={totalCount === maxItems ? 'success' : 'default'}
          variant='outlined'
          size='small'
        />
        <Chip
          label={`T$ ${totalCost}/${budget} gasto`}
          color={totalCost > budget ? 'error' : 'default'}
          variant='outlined'
          size='small'
        />
        <Chip
          label={`T$ ${remainingBudget} restante`}
          color={remainingBudget < 0 ? 'error' : 'info'}
          variant='outlined'
          size='small'
        />
      </Stack>

      <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        {sortedItems.map((item) => {
          const count = itemCounts[item.nome] || 0;
          const canAdd =
            remainingSlots > 0 && (item.preco || 0) <= remainingBudget;

          return (
            <Box
              key={item.nome}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
                px: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' noWrap>
                  {item.nome}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  T$ {item.preco}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  ml: 1,
                }}
              >
                <IconButton
                  size='small'
                  onClick={() => handleRemove(item)}
                  disabled={count === 0}
                  color='error'
                >
                  <RemoveIcon fontSize='small' />
                </IconButton>

                <Typography
                  variant='body2'
                  sx={{ minWidth: 24, textAlign: 'center' }}
                >
                  {count}
                </Typography>

                <IconButton
                  size='small'
                  onClick={() => handleAdd(item)}
                  disabled={!canAdd}
                  color='primary'
                >
                  <AddIcon fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Paper>

      {!isComplete && totalCount > 0 && totalCount < maxItems && (
        <Alert severity='warning'>
          Selecione mais {remainingSlots} ite
          {remainingSlots > 1 ? 'ns' : 'm'} para continuar. Orçamento restante:
          T$ {remainingBudget}.
        </Alert>
      )}

      {totalCount === maxItems && totalCost > budget && (
        <Alert severity='error'>
          O preço total (T$ {totalCost}) excede o orçamento de T$ {budget}.
          Remova itens mais caros.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Itens alquímicos selecionados com sucesso! Você pode continuar para o
          próximo passo.
        </Alert>
      )}
    </Box>
  );
};

export default AlchemyItemSelectionStep;
