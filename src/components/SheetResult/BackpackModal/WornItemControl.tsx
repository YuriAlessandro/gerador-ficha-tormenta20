import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import WearIcon from '@mui/icons-material/Checkroom';

import Equipment from '../../../interfaces/Equipment';

export interface WornItemControlProps {
  item: Equipment;
  isWorn: boolean;
  onChange: (worn: boolean) => void;
  size?: 'small' | 'medium';
}

/**
 * Botão de vestir/tirar dos dois únicos grupos com estado de vestimenta:
 * `Armadura` (id único em `wornArmorId`) e `Vestuário` (conjunto de guardados
 * em `unwornClothingIds`). O componente é agnóstico ao armazenamento — só
 * reporta a intenção; quem decide é o reducer da mochila.
 *
 * A microcópia difere de propósito: armadura se "tira", peça de vestuário se
 * "guarda" (continua na mochila, ocupando espaço).
 */
const WornItemControl: React.FC<WornItemControlProps> = ({
  item,
  isWorn,
  onChange,
  size = 'small',
}) => {
  const isArmor = item.group === 'Armadura';
  const isClothingItem = item.group === 'Vestuário';
  if (!isArmor && !isClothingItem) return null;

  let title: string;
  let label: string;
  if (isArmor) {
    title = isWorn
      ? 'Vestindo. Clique para tirar.'
      : 'Não vestida. Clique para vestir.';
    label = isWorn ? 'Tirar armadura' : 'Vestir armadura';
  } else {
    title = isWorn
      ? 'Vestindo. Clique para guardar na mochila.'
      : 'Na mochila. Clique para vestir. Guardada, a peça não aplica bônus.';
    label = isWorn ? 'Guardar peça na mochila' : 'Vestir peça';
  }

  return (
    <Tooltip title={title}>
      <IconButton
        size={size}
        color={isWorn ? 'primary' : 'inherit'}
        onClick={() => onChange(!isWorn)}
        aria-label={label}
      >
        <WearIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
};

export default WornItemControl;
