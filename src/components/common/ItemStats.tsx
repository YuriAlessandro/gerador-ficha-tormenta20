import React from 'react';
import { Chip, Stack } from '@mui/material';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import { isDefenseEquipment } from '@/functions/itemEnhancements/core';

interface ItemStatsProps {
  item: Equipment | DefenseEquipment;
}

/**
 * Chips genéricos de status de um item (dano, crítico, defesa, espaços).
 *
 * Versão simples, usada onde o item aparece isolado — como na escolha de
 * equipamento inicial de classe. O mercado usa uma variante própria dirigida
 * por descritor de categoria (`MarketStep/marketCategories.ts`), que mostra
 * colunas diferentes por tipo de item.
 */
const ItemStats: React.FC<ItemStatsProps> = ({ item }) => (
  <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
    {item.dano && (
      <Chip label={`Dano: ${item.dano}`} size='small' variant='outlined' />
    )}
    {item.critico && (
      <Chip label={`Crit: ${item.critico}`} size='small' variant='outlined' />
    )}
    {isDefenseEquipment(item) && (
      <Chip
        label={`Def: +${item.defenseBonus}`}
        size='small'
        variant='outlined'
        color='primary'
      />
    )}
    {item.spaces !== undefined && item.spaces > 0 && (
      <Chip label={`${item.spaces} esp.`} size='small' variant='outlined' />
    )}
  </Stack>
);

export default ItemStats;
