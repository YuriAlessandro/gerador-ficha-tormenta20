import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlareIcon from '@mui/icons-material/Flare';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CropFreeIcon from '@mui/icons-material/CropFree';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LockIcon from '@mui/icons-material/Lock';
import { ItemStatKind } from './itemPresentation';

/**
 * Ícone e rótulo de cada estatística — os mesmos nas cartas, na lista e na
 * carta ampliada, como os símbolos do Baralho de Magias.
 */
export const STAT_META: Record<
  ItemStatKind,
  { label: string; Icon: typeof PlayArrowIcon; wide: boolean }
> = {
  execution: { label: 'Execução', Icon: PlayArrowIcon, wide: false },
  range: { label: 'Alcance', Icon: FlareIcon, wide: false },
  duration: { label: 'Duração', Icon: HourglassBottomIcon, wide: false },
  target: { label: 'Alvo', Icon: GpsFixedIcon, wide: false },
  area: { label: 'Área', Icon: CropFreeIcon, wide: true },
  resistance: { label: 'Resistência', Icon: FavoriteIcon, wide: true },
  requirement: { label: 'Pré-requisito', Icon: LockIcon, wide: true },
};
