import { Spell, spellsCircles } from '../../../../interfaces/Spells';
import { SupplementSpells } from '../core';

/**
 * Novas magias do suplemento Heróis de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

// MAGIAS ARCANAS
const HEROIS_ARTON_ARCANE_SPELLS: Spell[] = [
  // 1º CÍRCULO (10 magias)
  {
    nome: 'Armadura Elemental',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Escolha um tipo de energia entre ácido, eletricidade, fogo ou frio. Uma aura faiscante dessa energia emana de seu corpo — sempre que uma criatura adjacente acertar um ataque corpo a corpo em você, ela sofre 2d6 pontos de dano do tipo escolhido.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta o dano em +1d6 (total de dados limitado pelo círculo máximo de magia que você pode lançar). Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'muda a energia para essência. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Assobio Perigoso',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    duracao: 'Especial',
    spellCircle: spellsCircles.c1,
    school: 'Conv',
    description:
      'Esta estranha magia conjura um grupo de criaturas agressivas que imediatamente atacam quem está por perto… Inclusive o conjurador e seus aliados! As criaturas são feitas de energia e representam um encontro, preparado pelo mestre, de ND igual ao nível do conjurador. Elas surgem em alcance curto e agem imediatamente após o turno do conjurador, atacando quem estiver por perto (decida aleatoriamente). As criaturas lutam até a morte ou até 1 minuto, quando então desaparecem, e não deixam corpos nem tesouro. A função original da magia é incerta. Estudiosos acreditam ser fruto de um experimento falho, ou uma tentativa de conjurar alguma criatura específica. De qualquer forma, hoje é utilizada para treinar aventureiros ou causar distrações em situações específicas.\n\nComponente Material: miniaturas em metal de criaturas (T$ 25 por nível do conjurador).',
    aprimoramentos: [],
  },
  {
    nome: 'Descobrir Fraqueza',
    execucao: 'Movimento',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade evita',
    spellCircle: spellsCircles.c1,
    school: 'Adiv',
    description:
      'Você analisa uma criatura em busca de pontos fracos e outras características. Para isso, como parte do efeito da magia, você faz um teste de Misticismo para identificar criatura contra o alvo (independente do tipo dele) com um bônus de +10.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o bônus no teste em +5.',
      },
      {
        addPm: 1,
        text: 'além do normal, sua próxima rolagem de dano contra a criatura nessa cena ignora 10 pontos da redução de dano dela. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'além do normal, você recebe +2 em testes contra a criatura até o fim da cena. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Distração Fugaz',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
    spellCircle: spellsCircles.c1,
    school: 'Ilusão',
    description:
      'Esta magia busca algo de grande interesse pessoal (uma pessoa, um item, uma lembrança...) na memória do alvo e produz uma breve ilusão disso, visível a todos os presentes. Não é necessário que você conheça o interesse do alvo, a própria magia faz essa revelação. A magia, entretanto, não é capaz de revelar detalhes minuciosos (como o nome de uma pessoa ou item desejado), produzindo uma versão "genérica" do objeto de interesse. Não importando a natureza da distração, se falhar em seu teste de Vontade, o alvo fica desprevenido durante 1 rodada.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, se falhar no teste de Vontade o alvo também sofre –5 em testes de Diplomacia e Intimidação até o fim da cena.',
      },
      {
        addPm: 1,
        text: 'muda o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'em vez de desprevenido, o alvo fica atordoado (apenas uma vez por cena).',
      },
      {
        addPm: 2,
        text: 'afeta todos os alvos válidos a sua escolha dentro do alcance. Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Espírito Balístico',
    execucao: 'Padrão',
    alcance: 'Curto',
    duracao: 'Sustentada',
    spellCircle: spellsCircles.c1,
    school: 'Conv',
    description:
      'Esta magia invoca um pequeno espírito feito de energia com aparência a sua escolha em um espaço desocupado. O espírito é fixo, permanecendo no lugar onde foi invocado. No começo dos seus turnos, o espírito dispara um projétil mágico contra o inimigo mais próximo em alcance médio, causando 1d6+1 pontos de dano de perfuração. O espírito não realiza outras ações e dispara projéteis a cada rodada, até que a magia termine, não existam mais inimigos no alcance ou o espírito seja destruído.\n\nO espírito tem Defesa igual à sua e 20 pontos de vida. Ele é imune a efeitos que pedem um teste de Fortitude ou Vontade e falha automaticamente em testes de Reflexos.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano em um dado do mesmo tipo (total de dados limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'muda o número de espíritos para dois. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o número de espíritos para três. Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: '(Apenas Golem [energia elemental], Qareen ou Kallyanach): muda o dado de dano para d8 e o tipo de dano para o tipo escolhido para sua habilidade racial elemental.',
      },
    ],
  },
  {
    nome: 'Farejar Fortuna',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Adiv',
    description:
      'Ao lançar esta magia, você descobre se existe algum tesouro em alcance longo. Para este efeito, "tesouro" é qualquer acúmulo de itens valiosos (acima do dinheiro inicial de um personagem do seu nível) que não estejam sendo carregados ou vestidos por uma criatura inteligente. Você sabe se há tesouros na área, mas não recebe nenhuma outra informação a respeito, como a direção ou localização do tesouro, seu valor exato, obstáculos no caminho... nada disso é informado pela magia.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alcance para toque, o alvo para um item recém-encontrado e a duração para instantânea. Em vez do normal, você recebe +5 em testes de perícia para identificar o item.',
      },
      {
        addPm: 2,
        text: 'além do normal, você recebe +5 em testes de perícia para localizar o tesouro.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, quando você rola qualquer dado para definir um tesouro, pode rolar dois dados e escolher qual resultado usar.',
      },
    ],
  },
  {
    nome: 'Maaais Klunc',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Ao lançar a magia, você adquire uma fantástica Força +10. Um relevante efeito colateral, contudo, é que sua Inteligência cai para acachapantes –3. Não, não uma penalidade de –3; um valor –3! Penalidades no atributo são aplicadas após isso. Pela duração de Maaais Klunc, você não pode lançar magias, nem é capaz de interromper esta magia de forma voluntária — nem mesmo soletrar essa palavra. O mestre pode (vai) exigir testes de Inteligência mesmo para as tarefas mentais mais simplórias, como achar a saída de um aposento vazio, diferenciar aliados de inimigos ou determinar qual extremidade da arma vai na direção do adversário.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura voluntária. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alcance para curto e o alvo para 1 criatura involuntária (Vontade evita). Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Ossos de Adamante',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Esta magia confere resistência extraordinária ao esqueleto, evitando ataques que causam fraturas graves. O alvo recebe redução de impacto 5 e fortificação 25%. Devido à rigidez do esqueleto, o corpo do alvo se torna incapaz de mudar de forma (como usar ou encerrar a habilidade Forma Selvagem). Se sofrer um efeito de metamorfose, em vez de mudar de forma o alvo perde 1d6 PV por PM gasto no efeito e fica lento. Essa condição não pode ser removida enquanto Ossos de Adamante estiver em efeito. Esta magia não afeta construtos.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a redução de impacto para RD 5 e a fortificação para 50%. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura viva.',
      },
    ],
  },
  {
    nome: 'Punho de Mitral',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'Esta magia transforma uma de suas mãos em mitral, tornando-a prateada como esse metal. A mão continua capaz de realizar movimentos normais e segurar objetos — mas também pode golpear ou esmagar. Se não estiver segurando nada com essa mão, você recebe +1 em testes de ataque e na margem de ameaça com ataques desarmados, e pode causar dano letal ou não letal com eles. Por fim, você pode manipular venenos com essa mão sem chance de se envenenar acidentalmente.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o bônus em testes de ataque e na margem de ameaça para +2.',
      },
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'além do normal, se você estiver empunhando uma arma ou um item esotérico com essa mão, ele recebe os benefícios do material especial mitral (mesmo que já possua outro material especial). Requer 2º círculo.',
      },
    ],
  },
  {
    nome: 'Toque do Horizonte',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma de ataque à distância',
    duracao: 'Cena',
    spellCircle: spellsCircles.c1,
    school: 'Trans',
    description:
      'A magia melhora a precisão da arma, aumentando seu alcance em um passo (de curto para médio e de médio para longo). Se o alcance da arma já é longo, ele é dobrado. Os efeitos desta magia contam como um bônus de encanto.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a arma ignora camuflagem leve e penalidades por cobertura leve.',
      },
      {
        addPm: 1,
        text: 'além do normal, a arma fornece +1 em testes de ataque e rolagens de dano feitos dentro do seu alcance original.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus do aprimoramento acima em +1 (bônus máximo limitado pelo círculo máximo de magia que você pode lançar).',
      },
      {
        addPm: 2,
        text: 'a margem de ameaça da arma aumenta em +1. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para uma arma de arremesso e a duração para sustentada. Em vez do normal, a arma recebe o benefício do encanto dançarina. Requer 3º círculo.',
      },
    ],
  },

  // 2º CÍRCULO (8 magias)
  {
    nome: 'Aura de Morte',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    area: 'Esfera com 6m de raio',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Necro',
    description:
      'Uma aura de frio necrótico emana a partir do seu corpo, alimentando-se de sua própria força vital. Quando você lança a magia, e no início de cada um dos seus turnos, você perde 1d6 pontos de vida e cada outra criatura na área perde 2d8 pontos de vida.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta a perda de vida para outras criaturas em +1d8 (número de dados de perda de vida máximos limitados pelo círculo máximo de magia que você pode lançar). Requer 3º círculo.',
      },
      {
        addPm: 3,
        text: 'adiciona resistência (Fortitude parcial). Além do normal, outras criaturas que percam pontos de vida pela magia devem fazer um teste de Fortitude. Se falharem, não podem recuperar PV por 1 rodada. Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Conjurar Armadilha',
    execucao: 'Completa',
    alcance: 'Curto',
    duracao: 'Permanente',
    spellCircle: spellsCircles.c2,
    school: 'Trans',
    description:
      'Esta magia modifica o terreno e/ou a arquitetura de um ponto no alcance, transformando-o em uma armadilha de caçador (Tormenta20, p. 50) a sua escolha. A armadilha criada segue as mesmas regras de armadilhas, mas a CD dos testes para encontrá-la e resistir a ela é a da magia. Embora seja produzida por magia, a armadilha ainda pode ser superada por meios mundanos normais. Depois de ativada, seja bem-sucedida ou não, a armadilha não volta a se reativar: fica inerte e inofensiva, devendo ser conjurada outra vez.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'seus poderes que afetam armadilhas também afetam a armadilha criada pela magia.',
      },
      {
        addPm: 3,
        text: 'quando lança a magia, você pode escolher qualquer número de criaturas no alcance para não serem afetadas pela armadilha. Requer 2º círculo.',
      },
      {
        addPm: 5,
        text: 'muda a execução para padrão. A armadilha pode ser conjurada diretamente em uma área ocupada por uma criatura, o que a aciona imediatamente. Requer 3º círculo.',
      },
      {
        addPm: 1,
        text: '(Apenas Armadilheiros Mestres e Caçadores): reduz o tempo de execução para movimento.',
      },
      {
        addPm: 4,
        text: '(Apenas Armadilheiros Mestres): em vez do normal, você pode conjurar uma das suas armadilhas de armadilheiro mestre.',
      },
    ],
  },
  {
    nome: 'Desafio Corajoso',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura voluntária',
    duracao: 'Sustentada',
    resistencia: 'Vontade anula',
    spellCircle: spellsCircles.c2,
    school: 'Encan',
    description:
      'Esta magia cria uma aura de influência de 9m ao redor do alvo. Outras criaturas que iniciarem seus turnos dentro da aura devem fazer um teste de Vontade. Se falharem, quaisquer ações hostis nesse turno devem ser feitas contra o alvo.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'muda o alvo para 1 criatura ou objeto. Requer 4º círculo.',
      },
    ],
  },
  {
    nome: 'Máquina de Combate',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 construto',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Trans',
    description:
      'Esta magia energiza a fonte de energia de um golem ou outro construto, sobrecarregando-a temporariamente. O alvo recebe +5 em Atletismo e Luta, mas perde 1d4 pontos de vida no fim de cada turno em que executar uma ação padrão.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'além do normal, os ataques corpo a corpo do alvo causam +1d6 pontos de dano.',
      },
      {
        addPm: 2,
        text: 'além do normal, o alvo recebe +2 na Defesa.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
    ],
  },
  {
    nome: 'Piscar',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Trans',
    description:
      'Pela duração da magia, você fica "piscando" entre o Plano material e o etéreo. Para quem o observa, é como se você ficasse visível e invisível várias vezes por segundo. Quaisquer ataques e habilidades (incluindo efeitos benéficos) de outras criaturas têm 50% de chance de não afetá-lo. Você recebe +2 em testes de ataque, pois é difícil ver de onde você está atacando. Contudo, seus próprios ataques e habilidades têm 25% de chance de não afetar outras criaturas, pois você não tem controle total sobre quando está em qual Plano. Você pode interagir com criaturas etéreas, com as mesmas chances de falha.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda o alcance para toque e o alvo para 1 criatura voluntária. Requer 3º círculo.',
      },
    ],
  },
  {
    nome: 'Poção Explosiva',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 poção',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Trans',
    description:
      'Esta magia transforma o conteúdo de uma poção em uma substância volátil e explosiva. Quando é usada, em vez de ter seu efeito normal, a poção causa 2d6 pontos de dano de essência por círculo da magia que ela continha (outras características da magia, como alvos, área e testes de resistência, se mantêm). Se a poção for ingerida, ela causa dano máximo à criatura que a ingeriu, sem direito a teste de resistência. Se esta magia for lançada sobre uma poção carregada por uma criatura, a criatura tem direito a um teste de Reflexos para evitar esse efeito. Reconhecer uma poção adulterada dessa forma exige um teste de Misticismo ou Ofício (alquimista) com CD 25.',
    aprimoramentos: [
      {
        addPm: 5,
        text: 'você pode determinar uma palavra-chave que, pronunciada por qualquer pessoa em alcance curto, faz a poção explodir. Requer 3º círculo.',
      },
      {
        addPm: 7,
        text: 'muda o alcance para pessoal e o alvo para área (esfera com 9m de raio). A magia afeta mesmo poções na área que estejam sendo carregadas. Requer 4º círculo.',
      },
    ],
  },
  {
    nome: 'Transposição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '2 criaturas voluntárias',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c2,
    school: 'Conv',
    description:
      'Esta magia teletransporta duas criaturas, incluindo seu equipamento, fazendo com que troquem de lugar imediatamente.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o número de alvos em +2. Você determina com quais criaturas cada alvo troca de lugar.',
      },
      {
        addPm: 5,
        text: 'a troca não exige linha de efeito, mas os alvos ainda devem estar dentro do alcance. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'muda o alvo para 2 criaturas do tipo lacaio e adiciona resistência (Vontade anula). Requer 4º círculo.',
      },
    ],
  },
  {
    nome: 'Viagem Onírica',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Adiv',
    description:
      'Lançar esta magia faz você adormecer e abandonar seu corpo físico. Você se torna um espírito incorpóreo com deslocamento de voo 18m. Você pode ver e ouvir, mas não falar ou emitir qualquer som — nem realizar ataques, lançar magias ou interagir de qualquer forma com criaturas e objetos materiais. Você ainda pode ser visto, em forma translúcida, e pode ser afetado por qualquer efeito que afete criaturas incorpóreas.\n\nQuando a magia acaba, você retorna imediatamente para seu corpo e desperta. A magia também é cancelada caso seu corpo físico seja perturbado de qualquer forma. Você sofre uma penalidade de –10 em testes de Percepção para notar ruídos próximos de seu corpo adormecido.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'você pode falar em sua forma incorpórea. Requer 3º círculo.',
      },
      {
        addPm: 5,
        text: 'você pode lançar magias em sua forma incorpórea. Requer 4º círculo.',
      },
    ],
  },
];

// MAGIAS UNIVERSAIS
const HEROIS_ARTON_UNIVERSAL_SPELLS: Spell[] = [
  // 1º CÍRCULO (1 magia)
  {
    nome: 'Discrição',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você ou 1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    spellCircle: spellsCircles.c1,
    school: 'Encan',
    description:
      'Esta magia torna a aparência do alvo desinteressante, como se ele fosse parte da paisagem, algo perdido na bagunça ou mais um na multidão. O alvo não se torna invisível, ainda é percebido como uma criatura ou objeto; o encantamento apenas desvia a atenção dos observadores para outras pessoas ou elementos ao redor. Testes de Investigação e Percepção contra o alvo sofrem uma penalidade de –10. Em combate, enquanto Discrição estiver ativa, todos os inimigos que iniciarem seus turnos a até 9m do alvo devem fazer um teste de Vontade. Se falharem, qualquer ação hostil que realizarem ignora a criatura. Esta magia se dissipa se você causar dano a qualquer criatura.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'muda o alvo para 1 criatura. Requer 2º círculo.',
      },
      {
        addPm: 2,
        text: 'aumenta a penalidade em testes para –15. Requer 2º círculo.',
      },
      {
        addPm: 3,
        text: 'além do normal, o alvo não pode ser detectado por magias de adivinhação. Requer 4º círculo.',
      },
    ],
  },

  // 2º CÍRCULO (2 magias)
  {
    nome: 'Desfazer Engenhoca',
    execucao: 'Padrão',
    alcance: 'Médio',
    duracao: 'Instantânea',
    spellCircle: spellsCircles.c2,
    school: 'Abjur',
    description:
      'Você desfaz os efeitos ativos de engenhocas, como se sua duração tivesse acabado (efeitos instantâneos não podem ser dissipados). Se lançar esta magia em uma criatura ou área, faça um teste de Misticismo; você dissipa os efeitos ativos de engenhocas com CD igual ou menor que o resultado do teste. Lançada diretamente contra uma engenhoca, aumenta a CD para ativá-la em +10 até o fim da cena. Lançada contra um construto, o teste é oposto à Vontade do alvo. Se você vencer, além do normal, o construto fica fraco e vulnerável (mesmo que seja imune a essas condições). A critério do mestre, esta magia pode afetar outras habilidades e itens similares a engenhocas.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'além do normal, você recebe +5 no seu teste de Misticismo para dissipar uma engenhoca para cada vez que a viu ser usada na cena.',
      },
      {
        addPm: 5,
        text: 'além do normal, a magia ignora qualquer efeito ativo gerado por engenhocas (por exemplo, um Campo Antimagia).',
      },
      {
        addPm: 12,
        text: 'muda a área para esfera com 9m de raio. Em vez do normal, cria um efeito de disjunção. Todos os efeitos de engenhocas na área são automaticamente dissipados e todas as engenhocas na área, exceto aquelas que você estiver carregando, enguiçam por uma cena (o usuário de engenhocas carregadas tem direito a um teste de Vontade para evitar isso; engenhocas soltas são itens mundanos e por isso não têm direito a testes, como normal). Requer 5º círculo.',
      },
    ],
  },
  {
    nome: 'Emular Magia',
    execucao: 'Movimento',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c2,
    school: 'Evoc',
    description:
      'Pela duração de Emular Magia, você pode lançar uma única magia que tenha visto ser lançada em alcance curto desde sua última rodada. A magia deve ser de um tipo (arcana ou divina) e de um círculo a que você tenha acesso.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'a magia emulada pode ser de qualquer tipo, arcana ou divina.',
      },
    ],
  },

  // 3º CÍRCULO (1 magia)
  {
    nome: 'Coração Imortal',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    spellCircle: spellsCircles.c3,
    school: 'Necro',
    description:
      'Manipulando energias necromânticas, você concentra sua força vital em uma parte específica do seu corpo. Você recebe fortificação 100% e imunidade a sangramento.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'muda a duração para 1 dia.',
      },
      {
        addPm: 2,
        text: 'aumenta a cura do aprimoramento abaixo para +10 PV.',
      },
      {
        addPm: 4,
        text: 'adiciona componente material (um coração de pedra no valor de T$ 100). Além do normal, quando seus pontos de vida são reduzidos a 0 ou menos, você cura 30 PV e a magia se encerra. Você só pode ser curado por este aprimoramento uma vez por dia.',
      },
    ],
  },
];

export const HEROIS_ARTON_SPELLS: SupplementSpells = {
  arcane: HEROIS_ARTON_ARCANE_SPELLS,
  divine: [],
  universal: HEROIS_ARTON_UNIVERSAL_SPELLS,
};

export default HEROIS_ARTON_SPELLS;
