import Equipment from '../../../../../interfaces/Equipment';
import Skill from '../../../../../interfaces/Skills';

/**
 * Armas do suplemento Heróis de Arton - Tormenta 20
 */

// ==========================================
// ARMAS SIMPLES
// ==========================================

// Corpo a Corpo — Leves
const BASTAO_LUDICO: Equipment = {
  nome: 'Bastão lúdico',
  descricao:
    'Causa dano não letal. Se for proficiente com armas marciais, uma vez por rodada, ao ser atingido por uma arma de arremesso, você pode fazer um teste de ataque com o bastão: se superar o do oponente, evita o ataque.',
  weaponCategory: 'simple',
  dano: '1d6',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 5,
};

// Ataque à Distância — Uma Mão
const BESTA_DE_MAO: Equipment = {
  nome: 'Besta de mão',
  descricao:
    'Besta pequena e discreta. É uma arma surpreendente e recarregá-la é uma ação de movimento.',
  weaponCategory: 'simple',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  group: 'Arma',
  preco: 30,
  ammoType: 'Virotes',
};

// ==========================================
// ARMAS MARCIAIS
// ==========================================

// Corpo a Corpo — Leves
const ADAGA_OPOSTA: Equipment = {
  nome: 'Adaga oposta',
  descricao:
    'Guarda elaborada, apropriada para bloqueios. Ao usar uma habilidade que permite um teste de ataque para evitar ou reduzir dano (como Aparar), você recebe +2 nesse teste.',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 12,
};

const AGULHA_DE_AHLEN: Equipment = {
  nome: 'Agulha de Ahlen',
  descricao:
    'Adaga de lâmina oca que armazena uma dose de veneno de contato. O veneno permanece até você acertar um ataque (não acaba no fim da cena) e a CD para resistir a ele aumenta em +2.',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 10,
};

const CINQUEDEA: Equipment = {
  nome: 'Cinquedea',
  descricao:
    'Lâmina triangular feita para estocar. Contra uma criatura desprevenida ou que você esteja flanqueando, causa um dado de dano extra do mesmo tipo.',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 18,
};

const DIRK: Equipment = {
  nome: 'Dirk',
  descricao:
    'Punhal longo que é parte da indumentária de nobres e oficiais. Atacando com um dirk, você pode atacar um oponente pelas costas, caído, desprevenido ou incapaz de lutar sem violar seu Código de Honra.',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 15,
};

const MARTELO_LEVE: Equipment = {
  nome: 'Martelo leve',
  descricao:
    'Martelo de peça única, apreciado por anões como arma secundária. Pode ser arremessado.',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d4',
  critico: 'x4',
  spaces: 1,
  tipo: 'Impacto',
  alcance: 'Curto',
  arremesso: true,
  group: 'Arma',
  preco: 2,
  specialActions: [
    { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
    {
      id: 'arremessar',
      label: 'Arremessar',
      skill: 'Pontaria',
      damageAttribute: 'Força',
    },
  ],
};

// Corpo a Corpo — Uma Mão
const ESPADA_LARGA: Equipment = {
  nome: 'Espada larga',
  descricao:
    'Lâmina menos afiada, porém mais larga e pesada que a da espada longa. Usada por bárbaros e mercenários.',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 8,
};

const ESPADIM: Equipment = {
  nome: 'Espadim',
  descricao:
    'Espada cerimonial dos nobres. Se for treinado em Nobreza, você recebe +1 em testes de ataque e rolagens de dano com um espadim, cumulativo com outros efeitos de itens.',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: '20',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 300,
};

const MACA_ESTRELA: Equipment = {
  nome: 'Maça-estrela',
  descricao:
    'Maça com cravos. Por seu peso e pontas proeminentes, causa dano de impacto e perfuração ao mesmo tempo.',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto e perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 20,
};

const SERRILHEIRA: Equipment = {
  nome: 'Serrilheira',
  descricao:
    'Facão de gume serrilhado. Ao acertar um ataque superando a Defesa do alvo por 5 ou mais, ele fica vulnerável por 1 rodada e sangrando. Sua aparência agressiva impõe –2 em Diplomacia e Enganação, cumulativo com outros itens.',
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Serrilheira' },
      target: { type: 'Skill', name: Skill.DIPLOMACIA },
      modifier: { type: 'Fixed', value: -2 },
      condition: {
        combinator: 'AND',
        clauses: [{ kind: 'wieldingItemNamed', value: 'Serrilheira' }],
      },
    },
    {
      source: { type: 'equipment', equipmentName: 'Serrilheira' },
      target: { type: 'Skill', name: Skill.ENGANACAO },
      modifier: { type: 'Fixed', value: -2 },
      condition: {
        combinator: 'AND',
        clauses: [{ kind: 'wieldingItemNamed', value: 'Serrilheira' }],
      },
    },
  ],
  weaponCategory: 'martial',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 25,
};

// Corpo a Corpo — Duas Mãos
const BICO_DE_CORVO: Equipment = {
  nome: 'Bico de corvo',
  descricao:
    'Haste de 2m com ponta de lança, gancho afiado de um lado e cabeça quadrada do outro. É um martelo alongado e versátil.',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d8',
  critico: 'x3',
  spaces: 2,
  tipo: 'Impacto/perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 15,
  twoHanded: true,
};

const DESMONTADOR: Equipment = {
  nome: 'Desmontador',
  descricao:
    'Haste longa com mecanismo de mola para prender pescoços e puxar inimigos de montarias. Pode ser usado para agarrar. Arma alongada e versátil.',
  weaponCategory: 'martial',
  dano: '-',
  critico: '-',
  spaces: 2,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 20,
  twoHanded: true,
};

const ESPADA_DE_EXECUCAO: Equipment = {
  nome: 'Espada de execução',
  descricao:
    'Você sofre –5 em testes de ataque com ela, a menos que gaste uma ação de movimento para prepará-la (o que elimina a penalidade no seu próximo ataque naquele turno).',
  weaponCategory: 'martial',
  dano: '2d6',
  critico: '18/x4',
  spaces: 2,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 75,
  twoHanded: true,
};

const LANCA_DE_JUSTA: Equipment = {
  nome: 'Lança de justa',
  descricao:
    'Funciona como uma lança montada, mas causa dano não letal. Em compensação, oferece vantagem própria em investidas montadas.',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: 'x2',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 3,
  twoHanded: true,
};

const MALHO: Equipment = {
  nome: 'Malho',
  descricao:
    'Martelo de cabeça de madeira dura e pesada. Arma versátil, fornecendo +2 em testes para derrubar ou empurrar. Por ser de madeira, pode ser fabricado em madeira Tollon.',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d10',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 8,
  twoHanded: true,
};

const MARTELO_LONGO: Equipment = {
  nome: 'Martelo longo',
  descricao:
    'Haste de 2m com ponta de metal afiada ao lado de uma cabeça densa e pesada. Combina o alcance da alabarda com a contundência do martelo: é uma arma alongada.',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '2d4',
  critico: 'x4',
  spaces: 2,
  tipo: 'Impacto/perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 12,
  twoHanded: true,
};

const TAN_KORAK: Equipment = {
  nome: 'Tan-korak',
  descricao:
    'Bastão metálico com ganchos, reentrâncias e um anel na ponta. Arma versátil, fornecendo +2 em testes para derrubar ou desarmar; causa dano letal ou não letal, a sua escolha.',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 40,
  twoHanded: true,
};

// Ataque à Distância — Uma Mão
const TAI_TAI: Equipment = {
  nome: 'Tai-tai',
  descricao:
    'Catapulta hynne em miniatura presa ao antebraço. Amarrá-la ou soltá-la é ação completa; recarregar é ação de movimento. Sem munição adequada dispara pedras comuns com dano reduzido em um passo.',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: 'Médio',
  group: 'Arma',
  preco: 60,
};

// Ataque à Distância — Duas Mãos
const ARCO_MONTADO: Equipment = {
  nome: 'Arco montado',
  descricao:
    'Você não sofre a penalidade em ataques à distância pelo balanço da montaria. Se já tem uma habilidade que elimina essa penalidade, em vez disso recebe +2 nas rolagens de dano com este arco enquanto montado.',
  weaponCategory: 'martial',
  dano: '1d6',
  critico: 'x3',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 45,
  twoHanded: true,
  ammoType: 'Flechas',
};

const FLECHAS: Equipment = {
  nome: 'Flechas (20)',
  descricao: 'Munição para arcos, vendida em pacotes de 20.',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 1,
  isAmmo: true,
  ammoType: 'Flechas',
  ammoPackSize: 20,
};

const BESTA_DUPLA: Equipment = {
  nome: 'Besta dupla',
  descricao:
    'Dois arcos sobrepostos, cada um com um virote. Permite usar o poder Disparo Rápido; se já o possui, pode usá-lo sem penalidade nos testes de ataque. Recarregar é uma ação completa.',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 125,
  twoHanded: true,
  ammoType: 'Virotes',
};

// Nota: 'Virotes (20)' não é redefinido aqui. O item é idêntico ao do livro
// básico (sempre carregado), e as cópias duplicadas apareciam três vezes na
// lista do mercado.

// ==========================================
// ARMAS EXÓTICAS
// ==========================================

// Corpo a Corpo — Leves
const KIMBATA: Equipment = {
  nome: 'Kimbata',
  descricao:
    'Faca em meia-lua com argola no cabo. Arma ocultável e surpreendente, mas exótica. Ao atacar uma criatura desprevenida com ela, você pode usar Furtividade no lugar de Luta no teste de ataque.',
  weaponCategory: 'exotic',
  dano: '1d4',
  critico: '18',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 12,
};

// Corpo a Corpo — Uma Mão
const CLAVA_GRAO: Equipment = {
  nome: 'Clava-grão',
  descricao:
    'Cultivada por druidas. Ao atacar com ela, você pode aplicar sua Sabedoria às rolagens de dano; se já faz isso por outra habilidade, em vez disso recebe +2 nas rolagens de dano, cumulativo com outros itens.',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 90,
};

const ESPADA_CANORA: Equipment = {
  nome: 'Espada canora',
  descricao:
    'Frestas na lâmina produzem um som gracioso quando brandida. Conta como instrumento musical para bardos. É uma arma ágil.',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 50,
};

const ESPADA_GADANHO: Equipment = {
  nome: 'Espada-gadanho',
  descricao:
    'Afiada na parte de dentro, não de fora. Arma ágil e surpreendente; o gume invertido exige treinamento especial, por isso é exótica.',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: '18',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 40,
};

const KHOPESH: Equipment = {
  nome: 'Khopesh',
  descricao:
    'Espada curva cuja lâmina forma um gancho para desestabilizar oponentes. Arma versátil, fornecendo +2 em testes para derrubar.',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '19/x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 20,
};

const LANCA_DE_FALANGE: Equipment = {
  nome: 'Lança de falange',
  descricao:
    'Arma alongada que pode ser arremessada. Grande demais para uso com uma mão sem treinamento especial, por isso é exótica. Pode ser usada como arma marcial de duas mãos.',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: 'x3',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  arremesso: true,
  group: 'Arma',
  preco: 15,
};

const MACHADO_DE_HASTE: Equipment = {
  nome: 'Machado de haste',
  descricao:
    'Cabeça de machado em cabo longo, criada pelos anões para formações fechadas. Arma adaptável e alongada, exótica; pode ser usada como arma marcial de duas mãos.',
  weaponCategory: 'exotic',
  weaponTags: ['heredrimm'],
  dano: '1d8/1d10',
  critico: 'x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 40,
};

const RAPIEIRA: Equipment = {
  nome: 'Rapieira',
  descricao:
    'Lâmina fina e alongada de um gume, mais precisa, mas que exige treinamento especial. É uma arma ágil.',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '18',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 50,
};

// Corpo a Corpo — Duas Mãos
const MARRAO: Equipment = {
  nome: 'Marrão',
  descricao:
    'Versão mais pesada da marreta de guerra. Grande demais para ser usado sem treinamento especial (exótica) e, por seu peso, também desbalanceada.',
  weaponCategory: 'exotic',
  weaponTags: ['heredrimm'],
  dano: '4d4',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 50,
  twoHanded: true,
};

const MONTANTE_CINETICO: Equipment = {
  nome: 'Montante cinético',
  descricao:
    'Esferas de adamante untadas no interior da lâmina multiplicam peso e impacto. Você pode usá-lo como arma marcial, mas nesse caso, ao rolar 1 ou 2 num teste de ataque com ela, você erra e atinge a si mesmo, sofrendo o dano.',
  weaponCategory: 'exotic',
  dano: '2d6',
  critico: '19/x4',
  spaces: 2,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 3000,
  twoHanded: true,
};

// Ataque à Distância — Uma Mão
const BOLEADEIRA: Equipment = {
  nome: 'Boleadeira',
  descricao:
    'Arma de arremesso típica de Namalkah. Pode ser usada para executar uma manobra derrubar à distância.',
  weaponCategory: 'exotic',
  dano: '1d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: 'Curto',
  group: 'Arma',
  preco: 12,
};

const CHAKRAM: Equipment = {
  nome: 'Chakram',
  descricao:
    'Disco metálico de bordas afiadas. Ao acertar, você pode fazê-lo voltar à mão (pegá-lo é reação) ou ricochetear em outro alvo, com novo ataque à distância e penalidade cumulativa de –5, até recuperá-lo ou errar. Arma exótica.',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: 'x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: 'Curto',
  group: 'Arma',
  preco: 15,
};

// Ataque à Distância — Duas Mãos
const ARCO_DE_GUERRA: Equipment = {
  nome: 'Arco de guerra',
  descricao:
    'Como um arco longo, permite aplicar sua Força às rolagens de dano e não pode ser usado montado. A força exigida para puxá-lo o torna uma arma desbalanceada.',
  weaponCategory: 'exotic',
  dano: '1d12',
  critico: 'x3',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 200,
  twoHanded: true,
  ammoType: 'Flechas',
  damageAttribute: 'Força',
};

const BALESTRA: Equipment = {
  nome: 'Balestra',
  descricao:
    'Besta pesada com catracas reguláveis: ao contrário de outras armas de disparo, você aplica sua Força às rolagens de dano. Arma exótica; recarregar é uma ação padrão.',
  weaponCategory: 'exotic',
  dano: '1d12',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 180,
  twoHanded: true,
  ammoType: 'Virotes',
  damageAttribute: 'Força',
};

const BESTA_DE_REPETICAO: Equipment = {
  nome: 'Besta de repetição',
  descricao:
    'Caixa acoplada com até 10 virotes e recarga automática. Arma exótica; sendo proficiente, você recarrega cada virote como ação livre e pode gastar 5 virotes para uma saraivada contra até três alvos adjacentes.',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 250,
  twoHanded: true,
  ammoType: 'Virotes',
};

// ==========================================
// ARMAS DE FOGO
// ==========================================

// Ataque à Distância — Leve
const GARRUCHA: Equipment = {
  nome: 'Garrucha',
  descricao:
    'Arma de fogo do tamanho de uma mão espalmada, fácil de esconder. É ocultável e surpreendente; recarregá-la é uma ação padrão.',
  weaponCategory: 'firearm',
  dano: '2d4',
  critico: '19/x3',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  group: 'Arma',
  preco: 250,
  ammoType: 'Balas',
};

const BALAS: Equipment = {
  nome: 'Balas (20)',
  descricao: 'Munição para armas de fogo, vendida em pacotes de 20.',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 20,
  isAmmo: true,
  ammoType: 'Balas',
  ammoPackSize: 20,
};

// Ataque à Distância — Duas Mãos
const CANHAO_PORTATIL: Equipment = {
  nome: 'Canhão portátil',
  descricao:
    'Arma desbalanceada. Se sua Força for menor que 4, sempre que atacar com ela você é arrastado 3m para trás. Usa bolas de ferro como munição; recarregar é uma ação completa.',
  weaponCategory: 'firearm',
  dano: '4d10',
  critico: '19/x3',
  spaces: 2,
  tipo: 'Impacto',
  alcance: 'Curto',
  group: 'Arma',
  preco: 3000,
  twoHanded: true,
  ammoType: 'Bola de Ferro',
};

const BOLA_DE_FERRO: Equipment = {
  nome: 'Bola de ferro (1)',
  descricao:
    'Esfera metálica com pólvora, munição de canhões portáteis. Diferente de outras munições, é vendida individualmente.',
  dano: '-',
  critico: '-',
  spaces: 0.5,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 5,
  isAmmo: true,
  ammoType: 'Bola de Ferro',
  ammoPackSize: 1,
  ammoUnitsPerSpace: 2,
};

const SIFAO_CAUSTICO: Equipment = {
  nome: 'Sifão cáustico',
  descricao:
    'Cilindro ligado por mangueira a uma mochila de munição. Dispersa ácido num cone de 6m (seu alcance máximo): faça um ataque à distância e compare com a Defesa de cada criatura na área. Usa ácido como munição.',
  weaponCategory: 'firearm',
  dano: '4d6',
  critico: 'x2',
  spaces: 2,
  tipo: 'Ácido',
  alcance: 'Especial',
  group: 'Arma',
  preco: 600,
  twoHanded: true,
};

export const HEROIS_ARTON_WEAPONS = {
  // Armas Simples
  BASTAO_LUDICO,
  BESTA_DE_MAO,
  // Armas Marciais - Leves
  ADAGA_OPOSTA,
  AGULHA_DE_AHLEN,
  CINQUEDEA,
  DIRK,
  MARTELO_LEVE,
  // Armas Marciais - Uma Mão
  ESPADA_LARGA,
  ESPADIM,
  MACA_ESTRELA,
  SERRILHEIRA,
  // Armas Marciais - Duas Mãos
  BICO_DE_CORVO,
  DESMONTADOR,
  ESPADA_DE_EXECUCAO,
  LANCA_DE_JUSTA,
  MALHO,
  MARTELO_LONGO,
  TAN_KORAK,
  // Armas Marciais - Distância
  TAI_TAI,
  ARCO_MONTADO,
  FLECHAS,
  BESTA_DUPLA,
  // Armas Exóticas - Leves
  KIMBATA,
  // Armas Exóticas - Uma Mão
  CLAVA_GRAO,
  ESPADA_CANORA,
  ESPADA_GADANHO,
  KHOPESH,
  LANCA_DE_FALANGE,
  MACHADO_DE_HASTE,
  RAPIEIRA,
  // Armas Exóticas - Duas Mãos
  MARRAO,
  MONTANTE_CINETICO,
  // Armas Exóticas - Distância
  BOLEADEIRA,
  CHAKRAM,
  ARCO_DE_GUERRA,
  BALESTRA,
  BESTA_DE_REPETICAO,
  // Armas de Fogo
  GARRUCHA,
  BALAS,
  CANHAO_PORTATIL,
  BOLA_DE_FERRO,
  SIFAO_CAUSTICO,
} satisfies Record<string, Equipment>;
