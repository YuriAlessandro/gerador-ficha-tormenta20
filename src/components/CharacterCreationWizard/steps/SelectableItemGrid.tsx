import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  TextField,
  Typography,
} from '@mui/material';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import ItemStats from '@/components/common/ItemStats';
import { normalizeSearch } from '@/functions/stringUtils';

type SelectableItem = Equipment | DefenseEquipment | string;

interface SelectableItemGridProps {
  items: SelectableItem[];
  /** Nome do item selecionado (itens de texto livre usam o próprio texto). */
  selectedName: string | undefined;
  onSelect: (item: SelectableItem) => void;
}

const getName = (item: SelectableItem): string =>
  typeof item === 'string' ? item : item.nome;

// Acima disso a grade fica alta demais pra rolar sem busca (ex.: pool de
// TODAS_AS_ARMAS do Nobre Zakharoviano, com quase 40 itens).
const SEARCH_THRESHOLD = 12;

/**
 * Grade de cards clicáveis para escolher UM item entre várias opções.
 * Compartilhada pelos passos de Equipamento Inicial (classe) e Itens da Origem.
 */
const SelectableItemGrid: React.FC<SelectableItemGridProps> = ({
  items,
  selectedName,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const validItems = items.filter(Boolean);

  const visibleItems = useMemo(() => {
    const query = normalizeSearch(search.trim());
    if (!query) return validItems;
    return validItems.filter((item) =>
      normalizeSearch(getName(item)).includes(query)
    );
  }, [validItems, search]);

  return (
    <Box>
      {validItems.length > SEARCH_THRESHOLD && (
        <TextField
          fullWidth
          size='small'
          placeholder='Buscar item...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1.5 }}
        />
      )}
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
        {visibleItems.map((item) => {
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
        {visibleItems.length === 0 && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Nenhum item encontrado.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SelectableItemGrid;
