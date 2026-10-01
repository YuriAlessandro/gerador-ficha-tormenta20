import Equipment from '../../../../interfaces/Equipment';

/**
 * Aparatos — Heróis de Arton, pp. 229 (preços) e 235–236 (regras).
 *
 * "Aparatos são itens utilizados por inventores para modificar o funcionamento
 * de suas engenhocas. Um aparato é acoplado a uma engenhoca e, enquanto estiver
 * acoplado, não ocupa espaços. Cada engenhoca pode ter até dois aparatos
 * diferentes. Usar um aparato aumenta a CD para ativar a engenhoca em +2. Usar
 * dois aparatos aumenta em +5."
 *
 * Os campos mecânicos opcionais são lidos por `functions/spells/engenhoca.ts`;
 * o resto do efeito fica só como texto exibido ao jogador.
 */
export interface Aparato {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  /** Somado à CD para resistir ao efeito da engenhoca. */
  resistDcBonus?: number;
  /** Somado ao custo total dos aprimoramentos na ativação. */
  aprimoramentoPmDelta?: number;
  /** Ignora a penalidade de armadura (da armadura) no teste de ativação. */
  ignoresArmorPenalty?: boolean;
  /** Opção ligável no teste de ativação que altera a CD. */
  activationDcToggle?: { label: string; value: number };
  /** Id de outro aparato exigido na mesma engenhoca. */
  requires?: string;
  /** Aviso de restrição exibido ao acoplar (não é validado). */
  restriction?: string;
}

export const APARATO_ACTIVATION_DC_ONE = 2;
export const APARATO_ACTIVATION_DC_TWO = 5;
export const MAX_APARATOS_PER_ENGENHOCA = 2;

export const APARATOS: Aparato[] = [
  {
    id: 'captador-de-luz',
    nome: 'Captador de luz',
    preco: 450,
    descricao:
      'Um conjunto de lentes e cristais adaptado à engenhoca, capaz de não apenas captar a luz mundana do ambiente, mas também a energia positiva presente nela. Toda cura de luz fornecida pela engenhoca aumenta em +1 por dado. Funciona apenas com engenhocas com efeitos de cura de luz.',
    restriction: 'Funciona apenas com engenhocas com efeitos de cura de luz.',
  },
  {
    id: 'comutador',
    nome: 'Comutador',
    preco: 300,
    descricao:
      'Uma bobina de metal místico, capaz de captar e potencializar a energia do ambiente. Diminui o custo total dos aprimoramentos da engenhoca em –1 PM.',
    aprimoramentoPmDelta: -1,
  },
  {
    id: 'conversor-alimentador',
    nome: 'Conversor-alimentador',
    preco: 300,
    descricao:
      'Este frasco de vidro é ligado a tubos de metal e estranhos mecanismos em forma de antena. Comporta três doses de essência de mana (ou outros preparados alquímicos que forneçam PM). Quando ativa a engenhoca, você pode gastar um preparado alquímico que forneça PM e usar os PM fornecidos para pagar seu custo de aprimoramentos e para sustentá-la (caso se aplique).',
  },
  {
    id: 'engenho-de-automacao',
    nome: 'Engenho de automação',
    preco: 600,
    descricao:
      'Este aparato envolve dezenas de engrenagens e pistões que funcionam sob a instrução de cartões perfurados, agindo por si só segundo um padrão programado. Acoplado a uma engenhoca que simula uma magia com duração sustentada, permite que ela não conte no limite de magias que você pode sustentar simultaneamente. Você só pode ter uma engenhoca sustentada adicional dessa forma por vez. Pré-requisito: conversor-alimentador.',
    requires: 'conversor-alimentador',
    restriction: 'Só tem efeito em engenhocas com duração sustentada.',
  },
  {
    id: 'espera-para-melhorias',
    nome: 'Espera para melhorias',
    preco: 150,
    descricao:
      'Este aparato funciona como um adaptador que permite instalar melhorias de outros itens na engenhoca. Fazer isso segue as mesmas regras e custos para aplicar melhorias em itens convencionais. De forma geral, se uma melhoria afeta uma característica da magia simulada pela engenhoca, ela pode ser aplicada (uma engenhoca que simula Armadura Arcana poderia receber melhorias de armaduras, por exemplo). Para materiais especiais, o custo da melhoria é baseado no tipo de efeito que ela vai gerar (arma, armadura ou esotérico — se mais de um for aplicável, você deve escolher apenas uma). Uma engenhoca pode receber mais de uma espera, e cada uma permite instalar uma melhoria (mas efeitos iguais não se acumulam, como normal). A critério do mestre, melhorias que não se apliquem naturalmente a engenhocas ainda podem ser aplicadas.',
  },
  {
    id: 'estabilizador',
    nome: 'Estabilizador',
    preco: 900,
    descricao:
      'Uma gaiola de arame fino que envolve uma engenhoca. Aumenta a CD para resistir ao efeito da engenhoca em +2.',
    resistDcBonus: 2,
  },
  {
    id: 'estimulador-de-sobrecarga',
    nome: 'Estimulador de sobrecarga',
    preco: 750,
    descricao:
      'Um mecanismo de aparência agressiva, com engrenagens barulhentas que giram de forma independente. Aumenta o dano provocado pela engenhoca em +1 dado. Funciona apenas em engenhocas que causam dano.',
    restriction: 'Funciona apenas em engenhocas que causam dano.',
  },
  {
    id: 'gatilho-de-corda',
    nome: 'Gatilho de corda',
    preco: 1500,
    descricao:
      'Um mecanismo simples, com algumas engrenagens e uma chave. Este aparato só pode ser instalado em engenhocas que simulem magias com execução de ação padrão, e permite que você ative a engenhoca com uma ação de movimento. Contudo, uma vez que a engenhoca seja ativada, você só poderá ativá-la novamente após dar corda no gatilho, o que exige uma ação completa.',
    restriction:
      'Só pode ser instalado em engenhocas que simulem magias com execução de ação padrão.',
  },
  {
    id: 'giroscopio',
    nome: 'Giroscópio',
    preco: 450,
    descricao:
      'Este sistema de contrapesos, amortecedores e roldanas é instalado ao redor da engenhoca, deixando-a sempre estável. Você não aplica sua penalidade de armadura por armadura nos testes de ativação da engenhoca (mas aplica penalidades de armadura de outras fontes).',
    ignoresArmorPenalty: true,
  },
  {
    id: 'ligacao-de-convergencia',
    nome: 'Ligação de convergência',
    preco: 300,
    descricao:
      'Este aparato deve ser acoplado a duas engenhocas (nem mais, nem menos), transformando ambas em uma. As duas engenhocas contam como uma só para efeitos do limite de engenhocas que você pode manter ao mesmo tempo. Contudo, uma vez que uma delas seja ativada, a outra não pode ser ativada na mesma cena. Nas cenas seguintes, é possível ativar a outra engenhoca, mas se o efeito da anterior ainda estiver ativo (como por durar 1 dia), ele é dissipado.',
    restriction: 'Deve ser acoplado a exatamente duas engenhocas.',
  },
  {
    id: 'remontagem-de-portabilidade',
    nome: 'Remontagem de portabilidade',
    preco: 300,
    descricao:
      'Este aparato é na verdade uma modificação total da engenhoca: uma série de molas, hastes e fios que permite que a engenhoca seja "desmontada" e unida a um item de vestuário. A engenhoca não ocupa nenhum espaço e, enquanto o item estiver vestido, conta como se também estivesse vestida (sem contar no limite de itens vestidos). Contudo, ela modifica drasticamente o item de vestuário. Qualquer um que o veja pode notar que há uma engenhoca mesclada ao item. Você só pode ter uma engenhoca vestida desta forma por vez.',
  },
  {
    id: 'sequenciador-de-ativacao',
    nome: 'Sequenciador de ativação',
    preco: 600,
    descricao:
      'Este mecanismo complexo, cheio de partes móveis, alavancas e engrenagens, é acoplado simultaneamente a três engenhocas. Uma vez por cena, você pode gastar uma ação completa para ativar o sequenciador. No início de cada um dos seus próximos turnos, uma das engenhocas acopladas ao sequenciador é ativada como uma ação livre, em uma ordem definida ao acoplá-las ao aparato. Não é possível diminuir a ação necessária para ativar o sequenciador. Você faz os testes de Ofício (engenhoqueiro) normalmente para cada engenhoca. Se algum dos testes falhar, além de essa engenhoca não ser ativada, a sequência de ativação termina (as próximas não serão mais ativadas como ação livre).',
    restriction: 'É acoplado simultaneamente a três engenhocas.',
  },
  {
    id: 'sistema-de-refrigeracao',
    nome: 'Sistema de refrigeração',
    preco: 900,
    descricao:
      "Um conjunto de ventoinhas que fazem ar fresco circular entre os componentes da engenhoca e tubos cheios d'água, que dissipam calor por sua correnteza interna. Uma vez por dia, você pode gastar uma ação completa e 1 PM para acionar as ventoinhas e resfriar a engenhoca. Fazer isso reduz a CD de ativação da engenhoca em –5.",
    activationDcToggle: {
      label: 'Sistema de refrigeração acionado (1x/dia, 1 PM)',
      value: -5,
    },
  },
  {
    id: 'supressor-de-seguranca',
    nome: 'Supressor de segurança',
    preco: 300,
    descricao:
      'Este sistema de mecanismos de contingência é instalado dentro da engenhoca e interrompe a operação do item em caso de mau funcionamento. Uma vez por cena, a engenhoca não enguiça com uma falha no teste de ativação (ela não ativa seu efeito, mas a CD para o próximo teste não aumenta e ela continua funcionando sem precisar ser consertada).',
  },
  {
    id: 'transformador-mistico',
    nome: 'Transformador místico',
    preco: 600,
    descricao:
      'Um conjunto de cristais ligados a mecanismos complexos, capaz de captar a energia mágica inerente a certos objetos e convertê-la para que possa ser usada em engenhocas. Permite acoplar um item esotérico à engenhoca, que fornece seus benefícios à magia simulada por ela (sem necessidade de ser empunhado). Acoplar ou remover o esotérico exige 1 hora de trabalho.',
  },
];

export const APARATOS_BY_ID: Record<string, Aparato> = Object.fromEntries(
  APARATOS.map((aparato) => [aparato.id, aparato])
);

export function getAparatoById(id: string): Aparato | undefined {
  return APARATOS_BY_ID[id];
}

/**
 * Aparatos como itens do mercado. "Aparatos acoplados a uma engenhoca não
 * ocupam espaços. Aparatos não acoplados ocupam 1 espaço cada."
 */
export const HEROIS_ARTON_APARATOS: Equipment[] = APARATOS.map((aparato) => ({
  nome: aparato.nome,
  descricao: `Aparato (acoplado a uma engenhoca, não ocupa espaço). ${aparato.descricao}`,
  group: 'Item Geral',
  preco: aparato.preco,
  spaces: 1,
}));
