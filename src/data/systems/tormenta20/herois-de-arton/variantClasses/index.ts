import { VariantClassOverrides } from '../../../../../interfaces/Class';
import ALQUIMISTA from './alquimista';
import ATLETA from './atleta';
import BURGUES from './burgues';
import DUELISTA from './duelista';
import ERMITAO from './ermitao';
import INOVADOR from './inovador';
import MACHADO_DE_PEDRA from './machadoDePedra';
import MAGIMARCIALISTA from './magimarcialista';
import NECROMANTE from './necromante';
import SANTO from './santo';
import SETEIRO from './seteiro';
import USURPADOR from './usurpador';
import VASSALO from './vassalo';
import VENTANISTA from './ventanista';

/**
 * Classes variantes do suplemento Heróis de Arton - Tormenta 20
 *
 * Classes variantes são modificações de classes base. Definem apenas os
 * overrides — tudo que não for definido é herdado automaticamente da classe base.
 * Poderes são sempre herdados da classe original.
 */
const HEROIS_ARTON_VARIANT_CLASSES: VariantClassOverrides[] = [
  ALQUIMISTA,
  ATLETA,
  BURGUES,
  DUELISTA,
  ERMITAO,
  INOVADOR,
  MACHADO_DE_PEDRA,
  MAGIMARCIALISTA,
  NECROMANTE,
  SANTO,
  SETEIRO,
  USURPADOR,
  VASSALO,
  VENTANISTA,
];

export default HEROIS_ARTON_VARIANT_CLASSES;
