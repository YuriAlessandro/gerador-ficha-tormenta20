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

/**
 * Lista de dogmas fundamentalistas que o personagem segue (Deuses de Arton,
 * p. 11–12): a da própria classe divina ou, para outras classes, a escolhida
 * pelo jogador entre as que o deus tem.
 */
export type DogmaFundamentalista = 'sacerdote' | 'druida' | 'paladino';

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
  /**
   * Fundamentalista (Deuses de Arton, p. 11): +1 poder concedido e um dogma
   * mais rígido. O app só informa a regra — nada é bloqueado. Incompatível com
   * `divindadeSecundaria` (o normalizer descarta a combinação).
   */
  fundamentalista?: { dogma: DogmaFundamentalista };
  /**
   * O fundamentalismo foi desligado e o poder concedido adicional dele pode
   * ainda estar em `poderes`. A ficha não sabe qual é (poderes concedidos
   * pegos depois, no lugar de poderes gerais, também vivem ali), então isto é
   * só um lembrete — some ao religar, ao remover um poder concedido no editor,
   * ao trocar de divindade ou quando o jogador decide manter.
   */
  poderAdicionalPendente?: boolean;
}
