import { SupplementClassPowers } from '../../core';
import ARCANISTA_POWERS from './arcanista';
import BARBARO_POWERS from './barbaro';
import BARDO_POWERS from './bardo';
import BUCANEIRO_POWERS from './bucaneiro';
import CACADOR_POWERS from './cacador';
import CAVALEIRO_POWERS from './cavaleiro';
import CLERIGO_POWERS from './clerigo';
import DRUIDA_POWERS from './druida';
import GUERREIRO_POWERS from './guerreiro';
import INVENTOR_POWERS from './inventor';
import LADINO_POWERS from './ladino';
import LUTADOR_POWERS from './lutador';
import NOBRE_POWERS from './nobre';
import PALADINO_POWERS from './paladino';

/**
 * Poderes de classe adicionais do suplemento Heróis de Arton
 * Estes poderes são adicionados às classes existentes quando o suplemento está ativo
 */
const HEROIS_ARTON_CLASS_POWERS: SupplementClassPowers = {
  Arcanista: ARCANISTA_POWERS,
  Bárbaro: BARBARO_POWERS,
  Bardo: BARDO_POWERS,
  Bucaneiro: BUCANEIRO_POWERS,
  Caçador: CACADOR_POWERS,
  Cavaleiro: CAVALEIRO_POWERS,
  Clérigo: CLERIGO_POWERS,
  Druida: DRUIDA_POWERS,
  Guerreiro: GUERREIRO_POWERS,
  Inventor: INVENTOR_POWERS,
  Ladino: LADINO_POWERS,
  Lutador: LUTADOR_POWERS,
  Nobre: NOBRE_POWERS,
  Paladino: PALADINO_POWERS,
};

export default HEROIS_ARTON_CLASS_POWERS;
