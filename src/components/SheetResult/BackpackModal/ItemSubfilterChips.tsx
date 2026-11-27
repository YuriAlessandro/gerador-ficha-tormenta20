import React, { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { equipGroup } from '../../../interfaces/Equipment';
import { CatalogCategory } from './equipmentCatalog';

/**
 * Rótulos amigáveis para cada ontologyTag, usados como label nos chips de
 * subfiltro — evita mostrar "Simples — HdA" quando só queremos "Simples".
 */
const ONTOLOGY_LABELS: Record<string, string> = {
  simples: 'Simples',
  marcial: 'Marcial',
  'exótica': 'Exótica',
  fogo: 'De Fogo',
  'munição': 'Munição',
  leve: 'Leve',
  pesada: 'Pesada',
  preparado: 'Preparado',
  catalisador: 'Catalisador',
  veneno: 'Veneno',
  aventureiro: 'Aventureiro',
  ferramentas: 'Ferramentas',
};

/** Filtros de empunhadura, derivados por campos do item (não do subgrupo). */
const HAND_FILTERS = [
  { key: '1m', label: '1 Mão' },
  { key: '2m', label: '2 Mãos' },
  { key: 'distância', label: 'Distância' },
  { key: 'arremesso', label: 'Arremesso' },
];

interface ItemSubfilterChipsProps {
  activeGroup: equipGroup;
  activeCategory: CatalogCategory;
  selected: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
}

const CONTAINER_SX = {
  px: 2,
  py: 0.75,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 0.75,
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'action.hover',
} as const;

/**
 * Chips de subfiltro ontológico que aparecem abaixo dos chips de categoria.
 * Para categorias sem subfiltros (Escudo, Vestuário, etc.) retorna null.
 */
const ItemSubfilterChips: React.FC<ItemSubfilterChipsProps> = ({
  activeGroup,
  activeCategory,
  selected,
  onToggle,
  onClear,
}) => {
  // Filtros derivados dos ontologyTags únicos dos subgrupos
  const sgFilters = useMemo(() => {
    const seen = new Set<string>();
    const filters: Array<{ key: string; label: string }> = [];
    activeCategory.subgroups.forEach((sg) => {
      if (sg.ontologyTag && !seen.has(sg.ontologyTag)) {
        seen.add(sg.ontologyTag);
        filters.push({
          key: sg.ontologyTag,
          label: ONTOLOGY_LABELS[sg.ontologyTag] ?? sg.ontologyTag,
        });
      }
    });
    return filters;
  }, [activeCategory.subgroups]);

  // Para Arma, também exibe filtros de empunhadura
  const extraFilters = activeGroup === 'Arma' ? HAND_FILTERS : [];

  const allFilters = [...sgFilters, ...extraFilters];

  // Sem opções ou apenas uma: subfiltro não agrega valor
  if (allFilters.length <= 1) return null;

  return (
    <Box sx={CONTAINER_SX}>
      <Typography variant='caption' color='text.secondary' sx={{ flexShrink: 0 }}>
        Filtrar:
      </Typography>
      {allFilters.map((f) => {
        const isActive = selected.includes(f.key);
        return (
          <Chip
            key={f.key}
            label={f.label}
            size='small'
            clickable
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'secondary' : 'default'}
            onClick={() => onToggle(f.key)}
          />
        );
      })}
      {selected.length > 0 && (
        <Chip
          label='Limpar filtros'
          size='small'
          variant='outlined'
          onClick={onClear}
        />
      )}
    </Box>
  );
};

export default React.memo(ItemSubfilterChips);
