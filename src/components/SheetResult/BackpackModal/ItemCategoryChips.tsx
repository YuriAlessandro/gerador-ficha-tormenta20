import React from 'react';
import { Box, Chip } from '@mui/material';
import { equipGroup } from '../../../interfaces/Equipment';
import { CATEGORY_ORDER, itemTypeStyles } from './itemTypeStyles';
import { CatalogCategory } from './equipmentCatalog';

interface ItemCategoryChipsProps {
  catalog: CatalogCategory[];
  activeGroup: equipGroup;
  onChange: (group: equipGroup) => void;
}

/**
 * Chips de categoria que se envolvem (wrap) no espaço disponível, eliminando
 * o overflow horizontal que ocorria com o `<Tabs variant="scrollable">`.
 * Renderiza `role="tab"` + `aria-selected` para compatibilidade com os testes
 * existentes que usam `getAllByRole('tab')`.
 */
const WRAP_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.75,
  px: 2,
  py: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
  mt: 1,
} as const;

const ItemCategoryChips: React.FC<ItemCategoryChipsProps> = ({
  catalog,
  activeGroup,
  onChange,
}) => (
  <Box sx={WRAP_SX} role='tablist' aria-label='Categoria de item'>
    {CATEGORY_ORDER.map((group) => {
      const cat = catalog.find((c) => c.group === group);
      const count =
        cat?.subgroups.reduce((s, sg) => s + sg.items.length, 0) ?? 0;
      if (count === 0) return null;
      const style = itemTypeStyles[group];
      const Icon = style.icon;
      const isActive = group === activeGroup;
      return (
        <Chip
          key={group}
          icon={<Icon style={{ fontSize: 14, color: style.color }} aria-hidden />}
          label={`${style.label} (${count})`}
          size='small'
          clickable
          variant={isActive ? 'filled' : 'outlined'}
          color={isActive ? 'primary' : 'default'}
          onClick={() => onChange(group)}
          role='tab'
          aria-selected={isActive}
        />
      );
    })}
  </Box>
);

export default React.memo(ItemCategoryChips);
