import React from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import ItemStats from '@/components/common/ItemStats';

type SelectableItem = Equipment | DefenseEquipment | string;

interface SelectableItemGridProps {
  items: SelectableItem[];
  /** Nome do item selecionado (itens de texto livre usam o próprio texto). */
  selectedName: string | undefined;
  onSelect: (item: SelectableItem) => void;
}

const getName = (item: SelectableItem): string =>
  typeof item === 'string' ? item : item.nome;

/**
 * Grade de cards clicáveis para escolher UM item entre várias opções.
 * Compartilhada pelos passos de Equipamento Inicial (classe) e Itens da Origem.
 */
const SelectableItemGrid: React.FC<SelectableItemGridProps> = ({
  items,
  selectedName,
  onSelect,
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(auto-fill, minmax(220px, 1fr))',
      },
      gap: 1,
    }}
  >
    {items.map((item) => {
      const name = getName(item);
      const isSelected = selectedName === name;
      return (
        <Card
          key={name}
          variant='outlined'
          sx={{
            borderColor: isSelected ? 'primary.main' : 'divider',
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: isSelected
              ? 'rgba(209, 50, 53, 0.08)'
              : 'transparent',
          }}
        >
          <CardActionArea onClick={() => onSelect(item)} sx={{ p: 1.5 }}>
            <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
              {name}
            </Typography>
            {typeof item !== 'string' && <ItemStats item={item} />}
          </CardActionArea>
        </Card>
      );
    })}
  </Box>
);

export default SelectableItemGrid;
