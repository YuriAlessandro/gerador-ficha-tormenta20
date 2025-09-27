export default interface SelectOptions {
  nivel: number;
  raca: string;
  classe: string;
  origin: string;
  devocao: { label: string; value: string };
  gerarItens?: 'nao-gerar' | 'consumir-dinheiro' | 'sem-gastar-dinheiro';
}
