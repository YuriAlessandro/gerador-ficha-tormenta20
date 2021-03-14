import { Atributo } from '../data/atributos';
import { CharacterAttributes } from '../interfaces/Character';

const attributes: CharacterAttributes = {
  Força: { name: Atributo.FORCA, value: 10, mod: 0 },
  Destreza: { name: Atributo.DESTREZA, value: 13, mod: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 11, mod: 0 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 19, mod: 4 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 18, mod: 4 },
  Carisma: { name: Atributo.CARISMA, value: 16, mod: 3 },
};

export default attributes;
