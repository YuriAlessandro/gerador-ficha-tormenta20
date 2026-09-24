import { SupplementId } from '../types/supplement.types';

export default interface SelectOptions {
  nivel: number;
  raca: string;
  classe: string;
  origin: string;
  devocao: { label: string; value: string };
  gerarItens?: 'nao-gerar' | 'consumir-dinheiro' | 'sem-gastar-dinheiro';
  supplements?: SupplementId[];
  /**
   * Devoções Abertas (regra opcional de Heróis de Arton, p. 281): o personagem
   * pode ser devoto de qualquer divindade, independente de raça ou classe.
   * Mora aqui — e não em `WizardSelections` — porque a divindade é escolhida no
   * formulário, antes do assistente abrir.
   */
  openDeities?: boolean;
  /**
   * Devoção Dupla (regra opcional de Sincretismos de Arton): o personagem
   * conta como devoto de dois deuses maiores. Mora aqui pelo mesmo motivo que
   * `openDeities` — a devoção é escolhida no formulário, antes do assistente.
   *
   * `sincretismo` pode ficar vazio com `dualDevotion` ligado: a regra permite
   * um par criado em conjunto pelo mestre e pelo jogador, sem sincretismo de
   * livro. É um estado válido, não um erro de preenchimento.
   */
  dualDevotion?: boolean;
  devocaoSecundaria?: { label: string; value: string };
  sincretismo?: { label: string; value: string };
}
