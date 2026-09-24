import { Atributo } from '../data/systems/tormenta20/atributos';
import Divindade from './Divindade';
import { GeneralPower } from './Poderes';

export interface CharacterAttribute {
  name: Atributo;
  value: number; // O modificador do atributo diretamente (-5 a +10)
}

export type CharacterAttributes = {
  [key in Atributo]: CharacterAttribute;
};

export interface CharacterReligion {
  divindade: Divindade;
  poderes: GeneralPower[];
  /**
   * Devoção dupla (regra opcional de Sincretismos de Arton): NOME da segunda
   * divindade. Guardado por nome — e não como objeto — pela mesma política de
   * `PoderCapturadoChoice`: o payload não engorda com o catálogo de poderes
   * (que `stripSheetForStorage` já precisa remover da primária) e correções no
   * catálogo alcançam fichas antigas, porque a resolução é feita no registry a
   * cada uso.
   *
   * Os poderes concedidos continuam num array ÚNICO (`poderes`): a regra diz
   * que a devoção dupla não concede poderes adicionais, só amplia a lista de
   * onde escolhê-los.
   */
  divindadeSecundaria?: string;
  /**
   * Nome do sincretismo do catálogo ao qual o par está associado. `undefined`
   * é um estado válido: a regra permite um sincretismo criado em conjunto pelo
   * mestre e pelo jogador, que não existe em livro nenhum.
   */
  sincretismo?: string;
}
