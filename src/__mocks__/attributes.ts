import { Atributo } from '../data/systems/tormenta20/atributos';
import { CharacterAttributes } from '../interfaces/Character';

const attributes: CharacterAttributes = {
  Força: { name: Atributo.FORCA, value: 0 },
  Destreza: { name: Atributo.DESTREZA, value: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 0 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 4 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 4 },
  Carisma: { name: Atributo.CARISMA, value: 3 },
};

export default attributes;
