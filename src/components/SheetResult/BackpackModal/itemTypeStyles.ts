import {
  AutoFixHigh as EsotericoIcon,
  Checkroom as VestuarioIcon,
  DirectionsCar as VeiculoIcon,
  Gavel as ArmaIcon,
  Handshake as ServicoIcon,
  Hotel as HospedagemIcon,
  Inventory2 as ItemGeralIcon,
  Pets as AnimalIcon,
  Restaurant as AlimentacaoIcon,
  Science as AlquimiaIcon,
  Security as EscudoIcon,
  Shield as ArmaduraIcon,
  SvgIconComponent,
} from '@mui/icons-material';

import { equipGroup } from '../../../interfaces/Equipment';

export interface ItemTypeStyle {
  icon: SvgIconComponent;
  /**
   * MUI palette token preferred (e.g. 'error.main') so the color follows
   * light/dark mode. Hex values are used only for categories that don't
   * map cleanly to a palette token.
   */
  color: string;
  label: string;
}

export const itemTypeStyles: Record<equipGroup, ItemTypeStyle> = {
  Arma: { icon: ArmaIcon, color: 'error.main', label: 'Arma' },
  Armadura: { icon: ArmaduraIcon, color: 'info.main', label: 'Armadura' },
  Escudo: { icon: EscudoIcon, color: 'warning.main', label: 'Escudo' },
  'Item Geral': {
    icon: ItemGeralIcon,
    color: 'text.secondary',
    label: 'Item Geral',
  },
  Alquimía: { icon: AlquimiaIcon, color: '#9c27b0', label: 'Alquimía' },
  Esotérico: { icon: EsotericoIcon, color: '#673ab7', label: 'Esotérico' },
  Vestuário: { icon: VestuarioIcon, color: '#795548', label: 'Vestuário' },
  Hospedagem: { icon: HospedagemIcon, color: '#009688', label: 'Hospedagem' },
  Alimentação: {
    icon: AlimentacaoIcon,
    color: '#4caf50',
    label: 'Alimentação',
  },
  Animal: { icon: AnimalIcon, color: '#8d6e63', label: 'Animal' },
  Veículo: { icon: VeiculoIcon, color: '#607d8b', label: 'Veículo' },
  Serviço: { icon: ServicoIcon, color: '#00acc1', label: 'Serviço' },
};

/**
 * Order in which categories should be presented in pickers and filters.
 * Combat categories first; mundane stuff at the end.
 */
export const CATEGORY_ORDER: equipGroup[] = [
  'Arma',
  'Armadura',
  'Escudo',
  'Item Geral',
  'Alquimía',
  'Esotérico',
  'Vestuário',
  'Alimentação',
  'Hospedagem',
  'Animal',
  'Veículo',
  'Serviço',
];
