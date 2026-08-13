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
}
