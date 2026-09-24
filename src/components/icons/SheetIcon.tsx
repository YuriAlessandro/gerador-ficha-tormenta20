/**
 * Resolve um `SheetIconKey` para um ícone renderizável.
 *
 * O id tem namespace (`mui:Shield`, `gi:magic/crystal-ball`) para que este
 * ponto seja o ÚNICO que sabe de onde o desenho vem. Quem guarda um layout
 * guarda a string; nem o documento nem o backend precisam saber que existe um
 * catálogo do game-icons.net.
 *
 * Os `mui:` são um mapa explícito, e não um import dinâmico do
 * `@mui/icons-material`: importar o pacote inteiro para resolver um nome em
 * runtime colocaria alguns milhares de ícones no bundle de todo mundo. Só o que
 * está aqui é referenciável — e é de propósito, porque essa lista existe para
 * dar nomes estáveis aos ícones padrão das seções, não para ser o catálogo. O
 * catálogo é o `gi:`.
 */
import React from 'react';
import { SvgIconProps } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BackpackIcon from '@mui/icons-material/Backpack';
import ColorizeIcon from '@mui/icons-material/Colorize';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import WidgetsIcon from '@mui/icons-material/Widgets';

import { SheetIconKey } from '../../interfaces/SheetLayout';
import GameIcon from './gameIcons/GameIcon';

const MUI_ICONS: Record<string, React.ComponentType<SvgIconProps>> = {
  AutoAwesome: AutoAwesomeIcon,
  AutoFixHigh: AutoFixHighIcon,
  Backpack: BackpackIcon,
  Colorize: ColorizeIcon,
  DirectionsRun: DirectionsRunIcon,
  Favorite: FavoriteIcon,
  Groups: GroupsIcon,
  HistoryEdu: HistoryEduIcon,
  MenuBook: MenuBookIcon,
  MilitaryTech: MilitaryTechIcon,
  NoteAlt: NoteAltIcon,
  Person: PersonIcon,
  Pets: PetsIcon,
  Psychology: PsychologyIcon,
  Shield: ShieldIcon,
  Widgets: WidgetsIcon,
};

export interface SheetIconProps extends SvgIconProps {
  iconKey?: SheetIconKey;
}

const SheetIcon: React.FC<SheetIconProps> = ({
  iconKey,
  fontSize,
  color,
  sx,
  className,
}) => {
  const [namespace, rest] = (iconKey ?? '').split(':');

  if (namespace === 'mui') {
    const Icon = MUI_ICONS[rest];
    if (Icon) {
      return (
        <Icon fontSize={fontSize} color={color} sx={sx} className={className} />
      );
    }
  }

  if (namespace === 'gi' && rest.includes('/')) {
    return (
      <GameIcon
        icon={rest}
        fontSize={fontSize}
        color={color}
        sx={sx}
        className={className}
      />
    );
  }

  // Id vazio ou desconhecido: o genérico em vez de nada, porque um item de
  // menu sem ícone desalinha a lista inteira.
  return (
    <WidgetsIcon
      fontSize={fontSize}
      color={color}
      sx={sx}
      className={className}
    />
  );
};

export default SheetIcon;
