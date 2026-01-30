import { Spell, spellsCircles } from '../../../../interfaces/Spells';
import { SupplementSpells } from '../core';

/**
 * Novas magias do suplemento Deuses de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

// MAGIAS ARCANAS
const DEUSES_ARTON_ARCANE_SPELLS: Spell[] = [];

// MAGIAS DIVINAS
const DEUSES_ARTON_DIVINE_SPELLS: Spell[] = [
  // 1º CÍRCULO
  {
    nome: 'Arma de Jade',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Esta magia ofertada por Lin-Wu transfere temporariamente para uma arma as qualidades místicas do jade, um raro material de Tamu-ra. A arma é considerada mágica, pode ser sacada e guardada como ação livre e fornece +1 nos testes de ataque e rolagens de dano (isso conta como um bônus de encanto). Contra espíritos, os bônus fornecidos pela magia são dobrados.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a arma causa +1d4 de dano de eletricidade.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus de ataque e dano em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Lin-Wu): muda o bônus de dano do aprimoramento acima para +2d4.',
      },
    ],
  },
  {
    nome: 'Arsenal de Allihanna',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Outrora chamada Armamento de Allihanna, esta magia recentemente recebeu um novo nome — com implicações curiosas. Utilizada pela primeira vez por Lisandra de Galrasia, diz-se que a verdadeira origem da magia estaria relacionada a seu pai, Arsenal, então mortal. Você invoca uma arma a sua escolha, em uma versão de madeira mágica que fornece +1 nos testes de ataque e rolagens de dano (isso conta como um bônus de encanto) e conta como uma arma primitiva para efeitos como a magia Armamento da Natureza. Se for uma arma de disparo, ela produz sua própria munição (mas você pode usar munição normal, se quiser). Arsenal de Allihanna não cria armas complexas (como bestas ou armas de fogo) e seus efeitos só funcionam em suas mãos.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'a arma, ou sua munição, é recoberta de espinhos. Ela causa +1d6 pontos de dano e o alvo do ataque fica sangrando.',
      },
      {
        addPm: 3,
        text: '(Apenas Devotos de Allihanna ou Dahllan): muda o alvo para uma planta e o alcance para toque. A planta manifesta uma arma corpo a corpo simples de madeira Tollon e uma armadura de couro batido reforçada. Se você tiver o suplemento Ameaças de Arton, ela pode manifestar uma espada espinhenta ou um fruto da espada-mãe (p. 245). Se estiver apto, você empunha/veste os itens como ação livre e eles desaparecem quando a magia acaba. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Bofetada de Nimb',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Uma mão mágica surge diante do alvo e o esbofeteia na face, ou em outra parte vulnerável, desaparecendo em seguida. O golpe não causa dano, mas é bastante humilhante. Se o alvo falhar na resistência, fica desprevenido por 1 rodada e vulnerável; se passar, fica apenas vulnerável por 1 rodada.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'alvos que falhem na resistência ficam vulneráveis pela cena.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, a mão dá leves tapinhas que acalmam os alvos e anulam uma condição entre abalado, alquebrado, apavorado e frustrado. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: 'alvos que falhem na resistência ficam desprevenidos por 1d4+1 rodadas, em vez de apenas 1.',
      },
      {
        addPm: 5,
        text: '(Apenas Devotos de Nimb): afeta todos os alvos válidos a sua escolha dentro do alcance.',
      },
    ],
  },
  {
    nome: 'Escapatória de Hyninn',
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'Por um breve instante, você adquire uma agilidade espantosa para se esquivar de algum perigo súbito. Você recebe +5 em um teste de Ladinagem para desarmar armadilhas ou de Reflexos.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda a execução para padrão e a duração para cena. Em vez do normal, o bônus se aplica a todos os testes destas perícias pela duração. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: '(Apenas Devotos de Hyninn): além do normal, o alvo pode usar Evasão (Tormenta20, p. 73).',
      },
      {
        addPm: 7,
        text: '(Apenas Devotos de Hyninn): além do normal, o alvo pode usar Evasão Aprimorada (Tormenta20, p. 75). Requer 4º círculo.',
      },
    ],
  },
  {
    nome: 'Euforia de Valkaria',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Encan',
    description:
      'Esta magia enche o alvo de disposição, apagando o medo (e bom senso) em seu coração e impedindo-o de ser intimidado por desafios árduos. O alvo se torna imune a medo e recebe +1 em testes de ataque quando luta em desvantagem (um encontro contra o dobro de inimigos que seu grupo, ou com ND maior que o do grupo).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o bônus em testes de ataque em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'muda a execução para reação e a duração para 1 rodada. Em vez do normal, o alvo recebe imunidade a medo e +5 em Vontade. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para área de esfera com 3m de raio. Você e todos os aliados na área são afetados pela magia. Requer 2º círculo.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Valkaria): muda o alcance para toque e o alvo para 1 criatura.',
      },
    ],
  },
  {
    nome: 'Execução de Thwor',
    execucao: 'Movimento',
    alcance: 'Curto',
    alvo: '1 humanoide sob efeito de uma condição de medo',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
    spellCircle: spellsCircles.c1,
    school: 'Necro',
    description:
      'Se acertar seu próximo ataque no alvo, ele se torna um acerto crítico. Se for um crítico naturalmente, em vez disso seu multiplicador aumenta em +1.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'em vez do normal, a magia afeta 1 alvo sob efeito de uma condição mental. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: '(Apenas Devotos de Thwor): se o ataque for um acerto crítico naturalmente, em vez do normal ele causa o efeito de um golpe de misericórdia (Tormenta20, p. 235). Requer 5º círculo.',
      },
    ],
  },
  {
    nome: 'Frescor de Lena',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    area: 'Raio de 9m',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'Você emana uma aura refrescante, que envolve você e aliados na área. A aura purifica o ar ao redor, eliminando todo tipo de fumaça, poeira, gás nocivo, nuvem ácida ou veneno de inalação, exceto se forem gerados por magias de 2º círculo ou maior.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta em 1 o círculo de magia afetado (limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque, a área para alvo (1 criatura) e a duração para 1 dia. Em vez do normal, suprime uma doença do alvo. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: '(Apenas Devotos de Lena): como acima, mas quando faz o teste da doença nesse dia, o alvo recebe um bônus de +5. Requer 3º círculo.',
      },
      {
        addPm: 9,
        text: '(Apenas Devotos de Lena): muda o alcance para toque, a área para alvo (1 criatura) e adiciona componente material (ervas no valor de T$ 1.000). O alvo recupera 1 ponto de atributo perdido por uma doença. Requer 4º círculo.',
      },
    ],
  },
  {
    nome: 'Fúria dos Antepassados',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Para aqueles devotados a Lin-Wu, respeito aos ancestrais é algo levado muito a sério — pois no além-vida, eles podem julgar suas ações e trazer fortuna ou desgraça. Esta magia invoca a alma de um antepassado da vítima para acusá-la de erros passados e trazer punição. O alvo sofre 1d6 pontos de dano psíquico e 1d6 pontos de dano de luz e fica pasmo por 1 rodada (apenas na primeira vez que é alvo desta magia na cena). Se passar no teste de resistência, sofre apenas metade do dano e evita a condição.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1. Requer 2º círculo.',
      },
      {
        addPm: 4,
        text: 'aumenta o dano psíquico e de luz em +1d6 cada.',
      },
      {
        addPm: 0,
        text: '(Apenas Devotos de Lin-Wu): muda o alvo para 1 criatura inteligente (Int –3 ou maior).',
      },
    ],
  },
  {
    nome: 'Futuro Melhor',
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c1,
    school: 'Adiv',
    description:
      'Esta magia permite enxergar todas as possibilidades e consequências de um evento muito recente, ainda a tempo de escolher o melhor caminho. O alvo recebe +2 em um teste cujo dado já rolou, mas cujo resultado o mestre ainda não tenha declarado.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Thyatis): muda o bônus para 1d4+2.',
      },
    ],
  },
  {
    nome: 'Infortúnio de Sszzaas',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    spellCircle: spellsCircles.c1,
    school: 'Necro',
    description:
      'Esta maldição menor reduz a resiliência da vítima, tornando-a mais suscetível a efeitos nocivos. O alvo sofre –2 em testes de sua resistência originalmente mais baixa.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, a vítima perde imunidade a venenos até o fim da próxima rodada. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta a penalidade em –1 (penalidade máxima limitada pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 3,
        text: '(Apenas Devotos de Sszzaas): além do normal, quando o alvo morre, deixa para trás um pequeno cristal com memórias e segredos. Ao resolver uma busca (Tormenta20, p. 278), um personagem pode quebrar um desses cristais para receber +2 em um teste de perícia. Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Instante Estoico',
    execucao: 'Reação',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'Invocando a proteção de Khalmyr, você resiste a agressões potencialmente perigosas. Quando sofre dano não mágico, você recebe RD 10 contra esse dano.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda a RD para 20. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'além do normal, para cada 10 pontos de dano que a magia reduzir em um turno, sua próxima rolagem de dano feita até a próxima rodada causa +1d6 pontos de dano de essência.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Khalmyr): muda a execução para padrão e a duração para cena, até ser descarregada. Em vez do normal, quando sofre dano não mágico, você pode receber RD 10 contra esse dano. A magia é descarregada após você usar este efeito pela terceira vez. Requer 3º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Khalmyr): muda o alcance para toque e o alvo para 1 criatura.',
      },
    ],
  },
  {
    nome: 'Magia Dadivosa',
    execucao: 'Movimento',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena, até ser descarregada',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Não é comum descrever uma divindade maior do Panteão como "maluquinha". Contudo, há ocasiões em que Wynna faz por merecer — como quando oferece estas dádivas caóticas. No início de seu turno, role 1d4. Em um resultado 4, você recebe 1 PM temporário que só pode ser gasto em aprimoramentos de magias. A magia é descarregada quando você recebe um total de 4 PM temporários. Você só pode lançar esta magia uma vez por cena.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para curto e o alvo para 1 criatura. Requer 3º círculo.',
      },
      {
        addPm: 0,
        text: '(Apenas Devotos de Wynna): muda a execução para padrão, o ganho para +2 PM temporários e o limite para descarregar para +8 PM.',
      },
    ],
  },
  {
    nome: 'Orbe do Oceano',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'O suposto desaparecimento do Oceano se mostra particularmente misterioso pelo fato de que seus devotos ainda podem lançar magias. Você cria um globo protetor de água salgada que ocupa 1 quadrado e o acompanha, fornecendo a você camuflagem leve e cobertura leve.',
    aprimoramentos: [
      {
        addPm: 4,
        text: 'muda a duração para cena. Requer 3º círculo.',
      },
      {
        addPm: 2,
        text: "(Apenas Devotos de Oceano): além do normal, você é considerado submerso. Isso exige que você prenda a respiração (a menos que possa respirar debaixo d'água), mas faz com que sofra apenas a metade do dano de armas de corte e impacto que não sejam armas naturais e é considerado submerso para benefícios de suas habilidades que dependam dessa situação.",
      },
    ],
  },
  {
    nome: 'Paixão de Marah',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Encan',
    description:
      'Você é cercado por uma aura de magnetismo pessoal que o torna mais interessante e atraente aos olhos dos demais. Você recebe +2 em perícias originalmente baseadas em Carisma (exceto Intimidação).',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para curto e o alvo para 1 criatura.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Marah): além do normal, o alvo recebe +1 em Carisma. Esse aumento não oferece PV ou PM adicionais.',
      },
      {
        addPm: 3,
        text: '(Apenas Devotos de Marah): muda a duração para 1 dia. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Perturbação Sombria',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Ilusão',
    description:
      'Com a proteção de Tenebra, você emana uma aura de sombras com 6m de raio. As sombras se movem de formas estranhas, com rangidos e gemidos sem explicação, vultos fugidios nas janelas e faces macabras urrando para sumir no instante seguinte. As demais criaturas na área sofrem –5 em testes de Percepção. Medo.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o efeito para aura de 9m.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para toque e o alvo para 1 criatura ou objeto. O alvo emana a aura.',
      },
      {
        addPm: 5,
        text: 'você pode escolher quais criaturas são afetadas pela aura. Requer 2º círculo.',
      },
      {
        addPm: 9,
        text: 'muda o alcance para curto, o alvo para área (esfera de 6m de raio), a execução para 1 hora, a duração para permanente e adiciona componente material (incenso e óleos no valor de T$ 1.000). Requer 5º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Tenebra): adiciona resistência (Vontade parcial). Além do normal, criaturas que comecem seu turno dentro da área ficam abaladas. Passar no teste de resistência evita a condição e impede que a criatura seja abalada por esta magia até o fim da cena. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Poder de Kallyadranoch',
    execucao: 'Movimento',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 turno',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Por um breve momento, você manifesta uma pequena parte da força e majestade das grandes feras dracônicas: a capacidade de criar elementos em sua forma mais pura. Até o fim do seu turno, a CD para resistir às suas habilidades mágicas que causam dano de ácido, eletricidade, fogo ou frio aumenta em +2.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta a CD em +1 (bônus máximo limitado pelo círculo máximo de magias que você pode lançar). Requer 3º círculo.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Kallyadranoch): além do normal, criaturas que falhem nos testes de resistência contra suas habilidades mágicas sofrem uma condição baseada no tipo de dano. Ácido: vulnerável até o fim da cena. Eletricidade: atordoado por 1 rodada (apenas uma vez por cena). Fogo: em chamas e vulnerável enquanto estiver em chamas. Frio: lento até o fim da cena. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Posse de Arsenal',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: '1 item empunhado',
    duracao: '1 dia',
    spellCircle: spellsCircles.c1,
    school: 'Conv',
    description:
      'Esta magia cria um vínculo poderoso entre você e seus pertences, dificultando sua perda ou roubo. Você recebe +5 em testes contra as manobras desarmar e quebrar, e de Percepção contra punga (veja Ladinagem) para roubá-lo. Além disso, se tiver o item tirado de você involuntariamente e ele estiver em alcance curto, você pode invocá-lo às suas mãos com uma ação livre.',
    aprimoramentos: [
      {
        addPm: 2,
        text: '(Apenas Devotos de Arsenal): além do normal, você também pode convocar uma arma à sua mão mesmo se ela tiver sido arremessada voluntariamente.',
      },
    ],
  },
  {
    nome: 'Proteção de Tauron',
    execucao: 'Movimento',
    alcance: 'Curto',
    alvo: '1 criatura que não você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'Esta antiga magia ofertada pelo Deus da Força ainda pode ser lançada mesmo após sua morte, preservada por divindades simpatizantes em honra a seu aspecto como protetor dos fracos. Quando a magia é lançada, luz sagrada envolve o alvo, que se torna um "protegido"; ele recebe +2 na Defesa e, quando se move em sua direção, o deslocamento dele é dobrado. Além disso, você sabe a direção e distância do alvo, e também se ele está ferido ou afetado por qualquer condição, independentemente da distância. Você não pode lançar esta magia enquanto for o "protegido" de outra criatura.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'além do normal, você pode usar habilidades mágicas com alcance de toque no alvo como se elas tivessem alcance curto.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +2 (bônus máximo limitado ao dobro do círculo máximo de magia que você pode lançar). Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Minotauros): além do normal, uma vez por rodada, quando uma criatura faz uma ação hostil contra o protegido, você pode gastar 1 PM para fazer um ataque corpo a corpo contra ela, desde que ela esteja em seu alcance pessoal.',
      },
    ],
  },
  {
    nome: 'Sigilo de Sszzaas',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 dia',
    spellCircle: spellsCircles.c1,
    school: 'Abjur',
    description:
      'Ofertada pelo Deus dos Segredos, esta magia é utilizada por todos que buscam preservar a própria privacidade. Pela duração da magia, quaisquer criaturas que fizerem testes de perícia para obter alguma informação a seu respeito sofrem –5 nesses testes. Isso inclui testes de Percepção para notá-lo, Conhecimento e Investigação para descobrir algo sobre você, Intuição para discernir suas mentiras e disfarces, e assim por diante.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'adiciona resistência (Vontade evita). Além do normal, criaturas que usem habilidades mágicas de detecção, como a magia Vidência, devem fazer um teste de Vontade. Se falharem, a habilidade não funciona e, pela duração da magia, novas tentativas de usar a mesma habilidade feitas pela mesma criatura falham automaticamente. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Sszzaas): muda a penalidade para –10.',
      },
    ],
  },
  {
    nome: 'Siroco de Azgher',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Invocando a fúria do Deus-Sol, você cria uma breve e focada tempestade de areia, capaz de esfolar a carne dos ossos! Criaturas afetadas sofrem dano de corte conforme seu grau de proteção: 3d6 se estiverem sem armadura, 2d6 se estiverem com armadura leve e 1d6 se estiverem com armadura pesada.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +1d6.',
      },
      {
        addPm: 1,
        text: 'muda o tipo de dano para luz.',
      },
      {
        addPm: 1,
        text: 'muda o alcance para pessoal e o alvo para área (cone de 9m). Requer 2º círculo.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Azgher): além do normal, criaturas que falhem na resistência ficam em chamas e sangrando.',
      },
    ],
  },
  {
    nome: 'Sorriso da Fortuna',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 dia, até ser descarregada',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Variantes desta magia, com diferentes nomes, são concedidas por Nimb, Hyninn, Sszzaas, Valkaria e até Thyatis. O objetivo, contudo, é sempre o mesmo: trapacear em jogos. Sorriso da Fortuna permite manipular os resultados de um jogo de azar. Quando fizer um teste de Jogatina (ou relacionado a algum jogo, a critério do mestre) você pode rolar dois dados e usar o melhor resultado. A magia é descarregada após você usar esse efeito três vezes. Esta magia afeta apenas jogos e itens mundanos, não mágicos. Além disso, embora funcione bem em pequenas tavernas, grandes cassinos empregam vigilantes atentos ao uso desta magia e suas variações.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta em +1 o total de usos antes de a magia ser descarregada.',
      },
      {
        addPm: 2,
        text: 'muda a execução para reação, o alcance para curto e o alvo para 1 criatura. Além disso, você lança a magia usando apenas concentração (Tormenta20, p. 170). Em vez do normal, a magia confunde um dos jogadores presentes, que rola seu teste de Jogatina com dois dados e usa o pior resultado.',
      },
      {
        addPm: 3,
        text: 'além do normal, você pode escolher um "número da sorte". Se o número da sorte for rolado em qualquer um dos dados, o resultado conta como um 20 natural. Requer 2º círculo.',
      },
      {
        addPm: 1,
        text: '(Apenas Devotos de Hyninn): muda a execução para reação e a duração para instantânea. Em vez do normal, quando faz seu primeiro teste de uma perícia em uma cena, você pode rolar dois dados e usar o melhor resultado.',
      },
    ],
  },
  {
    nome: 'Toque de Megalokk',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Criaturas de Allihanna seguem leis naturais. Monstros existem para violar essas leis. Após deformações horrendas, você se transforma em uma criatura do tipo monstro. Nessa forma, você recebe +5 em Intimidação, mas sofre –5 nas demais perícias baseadas em Carisma. Além disso, recebe uma arma natural de um tipo a sua escolha entre chifre, ferrão e mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com essa arma natural.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a margem de ameaça de suas armas naturais aumenta em +1.',
      },
      {
        addPm: 2,
        text: 'o dano de suas armas naturais aumenta em um passo. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: '(Apenas Devotos de Megalokk): além do normal, você recebe redução de dano 5. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Voz da Razão',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Encan',
    description:
      'Iluminada por Tanna-Toh, sua mente transborda de argumentos e informações. Você recebe +5 em Conhecimento, Diplomacia e Intimidação.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o bônus para +10. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Tanna-Toh): além do normal, você recebe +5 em Intuição e em testes de Investigação para interrogar.',
      },
    ],
  },

  // 2º CÍRCULO
  {
    nome: 'Couraça de Allihanna',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 armadura ou vestuário',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Abjur',
    description:
      'Lisandra de Galrasia foi a primeira a manifestar uma armadura fibrosa, mas hoje outros podem fazer o mesmo. Esta magia transforma o alvo em uma couraça arbórea. Se for uma armadura, seu bônus na Defesa aumenta em +2 e se for um vestuário, passa a fornecer +2 na Defesa (não cumulativo com armadura). Os efeitos desta magia contam como um bônus de encanto e ela só pode ser lançada em terrenos naturais. Dahllan recebem 1 PM para usar em aprimoramentos ao lançá-la.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a Defesa em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'além do normal, suas magias de evocação e transmutação custam –1 PM.',
      },
      {
        addPm: 2,
        text: 'o alvo é recoberto por folhas e galhos. Você recebe +5 em testes de Furtividade e pode se esconder mesmo sem camuflagem ou cobertura disponível.',
      },
      {
        addPm: 2,
        text: 'além do normal, o alvo fornece o mesmo bônus em testes de resistência. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'além do normal, o alvo é recoberto por esporos de cogumelo. Quando uma criatura faz um ataque corpo a corpo contra você, ela deve fazer um teste de Fortitude (CD da magia). Se falhar, fica paralisada por 1 rodada (apenas uma vez por cena) e lenta. Se passar, fica lenta por 1 rodada. Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Punição do Profano',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Instantânea',
    resistencia: 'Vontade reduz à metade',
    spellCircle: spellsCircles.c2,
    school: 'Evoc',
    description:
      'Por meio de um brado poderoso, entoando um dogma de sua religião, você inflige dano a devotos de divindades adversárias. Esta magia causa 6d8 pontos de dano de impacto a devotos de deuses que canalizam energia oposta a seu deus. Assim, se sua divindade canaliza energia positiva, a magia afeta devotos de deuses que canalizem energia negativa, e vice-versa. Devotos de deuses que canalizam qualquer energia ou criaturas que não sejam devotas sofrem apenas metade do dano. A magia afeta celestiais e abissais como se fossem devotos, respectivamente, de deuses de energia positiva e negativa, enquanto suraggel são afetados conforme sua herança. Nesses casos, a natureza planar se sobrepõe à devoção (um aggelus devoto de Tenebra ainda é considerado de energia positiva).',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 espírito ou morto-vivo.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +2d8.',
      },
      {
        addPm: 2,
        text: 'muda o alvo para 1 criatura.',
      },
      {
        addPm: 3,
        text: 'muda o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Traição da Lâmina',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma em posse de uma criatura',
    duracao: 'Cena, até ser descarregada',
    resistencia: 'Vontade (extinto)',
    spellCircle: spellsCircles.c2,
    school: 'Abjur',
    description:
      'Provavelmente ofertada por Sszzaas, esta magia amaldiçoa uma arma contra seu usuário. Quando faz um ataque com a arma, o usuário deve passar em um teste de Vontade. Se falhar, a arma se retorce como uma serpente, ou muda sua trajetória em pleno voo; o agressor se torna o alvo do próprio ataque! Após esse ataque, bem-sucedido ou não, a magia descarrega e a arma volta ao normal.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'em vez do usuário, a arma se volta para outra criatura em alcance curto que você possa perceber, a sua escolha.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para 1 arma e a duração para 1 dia, até ser descarregada. Requer 3º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1.',
      },
      {
        addPm: 2,
        text: 'adiciona componente material (uma dose de veneno). Além do normal, o ataque envenena o usuário com o veneno utilizado como componente (a CD desse veneno é a CD da própria magia).',
      },
    ],
  },
];

// MAGIAS UNIVERSAIS
const DEUSES_ARTON_UNIVERSAL_SPELLS: Spell[] = [
  // 1º CÍRCULO
  {
    nome: 'Flecha de Luz',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Esta magia lança uma flecha luminosa contra o alvo, que sofre 2d8+2 pontos de dano de luz e fica ofuscado por 1 rodada. Passar no teste de resistência reduz o dano à metade e evita a condição.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para uma criatura que tenha causado dano a você ou a seus aliados na última rodada e os dados de dano da magia para d10.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d8+1.',
      },
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +1 (número de alvos adicionais limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: '(Apenas Arcanos): alvos que falhem na resistência ficam cegos por 1 rodada e então ofuscados. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: '(Apenas Arqueiros de Lenórienn): muda o alcance para pessoal, o alvo para seu arco arcano, a duração para sustentada e a resistência para nenhuma. Em vez do normal, o alvo emite luz como uma tocha e causa +2d8+2 pontos de dano de luz. Criaturas que sofram dano do arco ficam ofuscadas (veja Arqueiro de Lenórienn em Heróis de Arton).',
      },
      {
        addPm: 1,
        text: '(Apenas Elfos): muda o alvo para 1 duyshidakk ou 1 devoto de Aharadak, Tauron ou Thwor. Muda os dados de dano para d10.',
      },
      {
        addPm: 2,
        text: '(Apenas Divinos): além do normal, para cada alvo que falhar na resistência, o próximo aliado que causar dano a ele recebe uma quantidade de PV temporários igual à metade do dano causado pela magia. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Percepção Rubra',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Adiv',
    description:
      'Esta magia faz o conjurador adquirir, por algum tempo, a estranha percepção de tempo dos lefeu — que permite ver alguns momentos no futuro. O alvo recebe +1 em testes de ataque, em Reflexos e na Defesa.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para curto e o alvo para 1 criatura.',
      },
      {
        addPm: 2,
        text: '(Apenas Devotos de Aharadak): aumenta o bônus em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
    ],
  },

  // 2º CÍRCULO
  {
    nome: 'Traição Mágica',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade reduz à metade',
    spellCircle: spellsCircles.c2,
    school: 'Abjur',
    description:
      'Esta magia desestabiliza outras magias ativas no alvo, fazendo com que elas causem uma súbita descarga de energia mística. Para cada círculo das magias afetando o alvo, ele sofre 1d8 pontos de dano de essência. Um alvo sob efeito de Velocidade e Voo (2º e 3º círculos) sofre 5d8 pontos de dano.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o alvo para criaturas escolhidas. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a resistência para nenhuma. Requer 3º círculo.',
      },
    ],
  },
];

const DEUSES_ARTON_SPELLS: SupplementSpells = {
  arcane: DEUSES_ARTON_ARCANE_SPELLS,
  divine: DEUSES_ARTON_DIVINE_SPELLS,
  universal: DEUSES_ARTON_UNIVERSAL_SPELLS,
};

export default DEUSES_ARTON_SPELLS;
