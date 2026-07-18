import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';

/**
 * Poderes concedidos das 63 divindades menores do Guia de Deuses Menores.
 * Cada deus menor concede exatamente um poder.
 */
const DEUSES_MENORES_POWERS: { [key in GeneralPowerType]: GeneralPower[] } = {
  [GeneralPowerType.COMBATE]: [],
  [GeneralPowerType.DESTINO]: [],
  [GeneralPowerType.MAGIA]: [],
  [GeneralPowerType.CONCEDIDOS]: [
    {
      name: 'Alcançar os Céus',
      description:
        'Você pode gastar uma quantidade de PM limitada por sua Sabedoria (mínimo de 1) para receber deslocamento de voo até o fim do seu turno. Esse deslocamento é igual a 12m, +3m para cada PM gasto além do primeiro.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hydora' }]],
    },
    {
      name: 'Alimento da Alma',
      description:
        'Você recebe treinamento em Ofício (cozinheiro) e aprende e pode lançar Abençoar Alimentos. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sunnary' }]],
    },
    {
      name: 'Alma em Erupção',
      description:
        'Você recebe redução de fogo 10 e, quando causa dano, pode perder 2 pontos de vida (exceto PV temporários) para causar +1d8 pontos de dano de fogo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Kurur Lianth' }]],
    },
    {
      name: 'Amor ao Machado',
      description:
        'Você pode gastar uma ação padrão e 3 PM para tocar um machado e colocar nele um encanto de arma a sua escolha. O encanto não pode ter pré-requisitos e dura até o fim da cena ou até você usar este poder novamente.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Goharom' }]],
    },
    {
      name: 'Armas e Espólios',
      description:
        'Você recebe uma proficiência a sua escolha entre armaduras pesadas, armas de fogo, armas marciais ou escudos. Se já tiver proficiência com armas marciais, pode escolher armas exóticas. Além disso, quando rolar um tesouro, como na tabela de Tesouro por Nível de Desafio (Tormenta20, p. 328), você pode rolar duas vezes para cada coluna apropriada e escolher entre os dois resultados.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Dunsark' }]],
    },
    {
      name: 'Arsenal do Oceano',
      description:
        'Você recebe proficiência em tridente e recebe +1 em testes de ataque e na margem de ameaça com essa arma. Se já for proficiente em tridente, seu dano aumenta em um passo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tessalus' }]],
    },
    {
      name: 'Artista das Armas',
      description:
        'Você pode infundir armas com uma fagulha divina. Gaste uma semana e T$ 100 e faça um teste de Ofício (armeiro) com CD igual à de fabricação da arma. Se passar, a arma se torna mágica e recebe uma melhoria cujos pré-requisitos cumpra (exceto material especial), que não conta em seu limite de melhorias.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Rhond' }]],
    },
    {
      name: 'Bolha Hídrica',
      description:
        'Uma vez por rodada, quando você ou um aliado em alcance curto faz um teste de resistência ou sofre dano, você pode gastar 2 PM para cuspir uma bolha de água protetora que fornece +5 nesse teste de resistência ou RD 15 contra esse dano. Estes benefícios são dobrados contra efeitos de fogo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Piscigeros' }]],
    },
    {
      name: 'Bênção do Frio',
      description:
        'Você recebe redução de frio 5. Além disso, se terminar o seu turno adjacente a um ou mais inimigos, eles ficam enredados por cristais de gelo por 1 rodada. Se já estavam enredados dessa forma, em vez disso ficam imóveis por 1 rodada (Fortitude evita a condição imóvel).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Beluhga' }]],
    },
    {
      name: 'Canção Divina',
      description:
        'Você pode usar Sabedoria para Atuação (em vez de Carisma) e como atributo-chave de suas magias de bardo (se as tiver). Além disso, aprende e pode lançar a magia Despedaçar. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Canora' }]],
    },
    {
      name: 'Canção dos Mares',
      description:
        'Você adquire a habilidade Canção dos Mares das sereias/tritões (Tormenta20, p. 30). Se já tiver essa habilidade, você pode escolher outras magia da lista da habilidade, ou as mesmas para diminuir seu custo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Ayllana' }]],
    },
    {
      name: 'Casco de Tartaruga',
      description:
        'Uma vez por rodada, quando sofre dano, você pode gastar 2 PM para receber RD 20 contra esse dano.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tamagrah' }]],
    },
    {
      name: 'Chamado da Colmeia',
      description:
        'Você pode gastar 1 PM e uma ação padrão para invocar um enxame de abelhas Grande com duração sustentada, que surge em um espaço a sua escolha em alcance médio. O enxame pode passar pelo espaço de outras criaturas e não impede que outras criaturas entrem no espaço dele. No final de seus turnos, o enxame causa 2d6 pontos de dano de perfuração a qualquer criatura em seu espaço (Reflexos CD Sab reduz à metade). Você pode gastar uma ação de movimento para mover o enxame 12m. A cada patamar além de iniciante, você pode gastar +1 PM quando invoca o enxame para aumentar seu dano em +2d6.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Apis' }]],
    },
    {
      name: 'Conjurar Cristal',
      description:
        'Você pode gastar uma ação de movimento e 3 PM para conjurar um cristal azul, verde ou vermelho. Conforme a cor do cristal, você pode quebrá-lo para gerar um efeito: azul (recebe RD 20 contra um dano recém-sofrido); verde (rola novamente um teste de resistência recém-realizado); vermelho (ganha uma ação de movimento nesse turno). O cristal dura até o fim da cena, até ser usado ou até você conjurar outro cristal.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'O Deus Cristal de Urielka' }],
      ],
    },
    {
      name: 'Despertar do Gigante',
      description:
        'Você pode gastar uma ação de movimento e 3 PM para se tornar fisicamente mais imponente. Até o fim da cena você recebe +1 em Força e é considerado uma categoria de tamanho maior para modificadores de manobra de combate.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Teldiskan' }]],
    },
    {
      name: 'Disparo Sublime',
      description:
        'Você pode gastar uma ação de movimento e 2 PM para fazer um teste de Percepção (CD 15 + ND da criatura) contra uma criatura em alcance médio. Se passar no teste e acertar um ataque com arco contra o alvo na mesma rodada, esse ataque é um acerto crítico automático. Se for o paladino de Cette, você pode usar Golpe Divino com ataques com arco à distância.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Cette' }]],
    },
    {
      name: 'Dom de Armadilheiro',
      description:
        'Você recebe um poder de Armadilha do caçador a sua escolha e a CD de todas as suas armadilhas aumenta em +2. Além disso, você pode aprender Conjurar Armadilha (Heróis de Arton, p. 252) como uma magia divina.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Canastra' }]],
    },
    {
      name: 'Domínio do Medo',
      description:
        'Você recebe +2 em Intimidação e na CD de seus efeitos de medo, e pode escolher poderes relacionados a efeitos de medo sem necessidade de cumprir pré-requisitos de classe ou devoção. Por fim, pode aprender magias de medo como magias divinas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'O Deus do Medo' }],
      ],
    },
    {
      name: 'Ego',
      description:
        'Quando faz um teste, você pode gastar 1 PM para receber +5 nesse teste. Se fizer isso e falhar no teste, até o fim da cena você sofre uma penalidade de –2 em testes e não pode usar este poder.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sckhar' }]],
    },
    {
      name: 'Espadachim Divino',
      description:
        'Você recebe +1 nas rolagens de dano e no multiplicador de crítico com espadas e, para você, todas as espadas marciais são armas simples.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'A Espada-Deus' }]],
    },
    {
      name: 'Espírito da Alcateia',
      description:
        'Você pode se comunicar livremente com todos os tipos de cães e lobos, como se estivesse sob efeito da magia Voz Divina. Além disso, quando ataca um inimigo que você esteja flanqueando, você recebe +2 na rolagem de dano.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Akok' }]],
    },
    {
      name: 'Etiqueta a Toda Hora',
      description:
        'Uma vez por cena, você pode gastar uma ação de movimento e 1 PM para fazer um teste de Nobreza para ajudar. Cada aliado em alcance curto pode usar o bônus de ajuda fornecido por este teste em um de seus testes de perícia feito até o fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Jandra' }]],
    },
    {
      name: 'Fisgar Corações',
      description:
        'Você aprende e pode lançar a magia Enfeitiçar (atributo- chave Carisma) usando apenas concentração, sem necessidade de gestos ou palavras (como se sob efeito do poder Magia Discreta). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Irione' }]],
    },
    {
      name: 'Furacão de Lâminas',
      description:
        'Uma vez por rodada, quando erra um ataque corpo a corpo, você pode gastar 2 PM para fazer um novo ataque (com a mesma arma) contra outra criatura ao seu alcance.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lamashtu' }]],
    },
    {
      name: 'Ginete Altivo',
      description:
        'Enquanto está montado sobre um cavalo, você recebe +2 em testes de ataque e em Cavalgar. Além disso, você passa automaticamente em testes de Cavalgar para não cair do cavalo quando sofre dano e não sofre penalidades para atacar à distância ou lançar magias quando montado em cavalos. Este poder conta como o poder Ginete para efeitos de pré-requisitos de outras habilidades. Se você é um centauro, os benefícios deste poder mudam para: você pode fazer investidas em terreno difícil e não sofre a penalidade de –2 na Defesa por fazer uma investida. Por fim, recebe +2 nas rolagens de dano com armas em investidas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hippion' }]],
    },
    {
      name: 'Guardei para Você',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para produzir uma lembrança, na forma de uma memória ou de um objeto, para um aliado em alcance curto. Uma memória fornece +1d4 em um teste de perícia feito até o fim da cena, enquanto um objeto é uma versão mundana e não superior de um item não consumível a sua escolha, que dura até o fim da cena ou até ser largado pelo aliado. Você só pode produzir uma lembrança para cada aliado na mesma cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Mauziell' }]],
    },
    {
      name: 'Igual ao Lar',
      description:
        'Uma vez por dia, você pode gastar alguns minutos para transformar um espaço de descanso em um lar provisório por um dia. Todas as criaturas que descansarem nesse local aumentam sua recuperação de PV ou PM em +1 por nível (a escolha da criatura) e, enquanto estiverem nesse lar, recebem +1 em testes de perícias.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Gratissa' }]],
    },
    {
      name: 'Incentivador da Economia',
      description:
        'A cada T$ 50 x seu nível que gastar em uma aventura, você recebe +1 PM cumulativo até o fim da aventura.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tibar' }]],
    },
    {
      name: 'Inimigo dos Deuses',
      description:
        'Você recebe resistência a magia divina +5 e, contra devotos de outros deuses, recebe +2 em testes de ataque e na CD de suas habilidades.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sartan' }]],
    },
    {
      name: 'Inspiração Concedida',
      description:
        'Você pode gastar 2 PM para evocar o poder da criatividade. Até o fim da cena, sempre que fizer um teste de perícia, você recebe um bônus cumulativo de +1 nesse teste (ou seja, +1 no primeiro teste, +2 no segundo teste, +3 no terceiro e assim por diante). Esse bônus dura até o fim da cena ou até você fazer um teste de uma perícia que já tenha usado nesta cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Anilatir' }]],
    },
    {
      name: 'Investida Tempestade',
      description:
        'Quando faz uma investida, você pode gastar 2 PM para cobrir seu corpo com eletricidade. Se fizer isso, seu ataque causa +2d8 pontos de dano de eletricidade. Além disso, criaturas adjacentes ao caminho que você percorre na investida sofrem 2d8 pontos de dano de eletricidade e ficam ofuscadas por 1 rodada (Ref CD Sab reduz à metade e evita a condição).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Benthos' }]],
    },
    {
      name: 'Irmão da Coragem',
      description:
        'Você se torna imune a medo (se já for imune, em vez disso recebe +2 em Vontade). Além disso, uma vez por cena envolvendo um perigo, você pode substituir um teste de perícia por um teste de Vontade.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Zakharov' }]],
    },
    {
      name: 'Jogada Decisiva',
      description:
        'Uma vez por dia, quando faz um teste, você pode gastar 1 PM para somar +2 por patamar no teste.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Champarr' }]],
    },
    {
      name: 'Liberdade Irrestrita',
      description:
        'Você recebe +2 em testes de manobra para evitar ser agarrado e de resistência contra efeitos mentais, de medo, de metamorfose e de movimento. Além disso, se falhar num desses testes, pode rolá-lo novamente. Se ainda assim falhar, no início de cada um de seus turnos pode rolar esse teste novamente, como uma ação livre e com um bônus cumulativo de +2, até se libertar.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Gwendolynn' }]],
    },
    {
      name: 'Liberdade das Montanhas',
      description:
        'Quando faz um teste de Atletismo para escalar, você rola dois dados e usa o melhor resultado. Além disso, se você estiver em terreno elevado, recebe +2 em testes de perícia contra criaturas em terreno inferior.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Altair' }]],
    },
    {
      name: 'Manha da Cidade',
      description:
        'Quando está em uma comunidade, você soma sua Sabedoria (mínimo de 1) em testes de Conhecimento, Investigação, Ladinagem e Nobreza, e pode fazer testes dessas perícias mesmo sem ser treinado. Além disso, em comunidades pode fazer testes para interrogar sem precisar falar com pessoas ou gastar tibares, questionando a própria cidade.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'O Deus das Cidades' }],
      ],
    },
    {
      name: 'Manutenção Sagrada',
      description:
        'Uma vez por dia, você pode gastar 10 minutos ajustando sua própria armadura. Faça um teste de Ofício (armeiro) para ajudar. Enquanto estiver trajando esta armadura, você recebe um bônus na Defesa igual ao bônus de ajuda fornecido pelo teste. Entretanto, a cada vez que você for atingido por um ataque, esse bônus diminui em 1 (até um mínimo de 0).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Klangor' }]],
    },
    {
      name: 'Mar Aberto',
      description:
        'Você aprende e pode lançar Caminhos da Natureza. Você só pode lançar essa magia em ambientes aquáticos, mas pode aplicar seu bônus em deslocamento em qualquer embarcação em que esteja. Caso aprenda novamente essa magia, pode usá-la em qualquer ambiente e seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Marina' }]],
    },
    {
      name: 'Máscara Mística',
      description:
        'Se estiver usando uma máscara, você pode lançar as magias Disfarce Ilusório e Proteção Divina (mas apenas em você mesmo). Caso aprenda uma dessas magias, seu custo diminui em –1 PM enquanto você estiver de máscara.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Blinar' }]],
    },
    {
      name: 'Na Ponta da Língua',
      description:
        'Sempre que fizer um teste de Vontade para resistir a uma habilidade de uma criatura inteligente (Int –3 ou maior), você pode gastar 2 PM para propor uma charada a ela. Faça um teste de Enganação, oposto pelo Conhecimento ou Intuição da criatura. Se você vencer o teste, passa automaticamente no teste de Vontade. Caso contrário, faça o teste de Vontade normalmente.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Garanaam' }]],
    },
    {
      name: 'Natureza Gloriosa',
      description:
        'Você pode gastar 2 PM para que uma parte de seu corpo assuma uma forma animalesca até você ficar inconsciente ou escolher encerrá-la (uma ação livre). Quando faz isso, você recebe dois benefícios a sua escolha entre os seguintes: uma arma natural à sua escolha (dano 1d6, crítico x2, a sua escolha entre corte, impacto ou perfuração); +1 passo de dano em uma de suas armas naturais; +2 na Defesa; +6m de deslocamento; deslocamento de natação 9m; faro; ou +5 em Atletismo e Fortitude.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Zadbblein' }]],
    },
    {
      name: 'Olhar Atordoado',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para forçar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se falhar, a criatura fica atordoada por 1 rodada (apenas uma vez por cena). Se você já tiver esta habilidade, em vez disso ela passa a afetar criaturas a sua escolha em alcance curto e a CD para resistir a ela aumenta em +2.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Escamandra' }]],
    },
    {
      name: 'Olhos do Vigia',
      description:
        'Você recebe +2 em Percepção, não fica surpreendido e desprevenido contra inimigos que não possa perceber e nunca acerta o alvo errado ao atacar alguém envolvido na manobra agarrar. Quando erra um ataque devido a camuflagem, pode rolar mais uma vez o dado da chance de falha.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Betsumial' }]],
    },
    {
      name: 'Oprimir Escolhas',
      description:
        'Quando uma criatura em alcance curto faz um teste de perícia, você pode gastar 2 PM para forçar essa criatura a escolher 10 nesse teste (mesmo que isso não seja possível). A criatura tem direito a um teste de Vontade (CD Sab) para resistir a esse efeito. Você só pode usar este poder uma vez por criatura em cada cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Yasshara' }]],
    },
    {
      name: 'Passo do Caçador',
      description:
        'Você recebe +2 em Sobrevivência e soma sua Sabedoria em Furtividade. Além disso, contra criaturas desprevenidas ou surpreendidas, seus ataques causam +1d6 pontos de dano.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lupan' }]],
    },
    {
      name: 'Poder da Amizade',
      description:
        'Escolha um personagem para ser seu amigo de fé. Se estiver em alcance médio dele e vocês puderem pelo menos trocar olhares, você recebe +2 em todos os testes de perícia e o custo de suas habilidades que tenham ele como alvo diminui em –1 PM (cumulativo com outras reduções). Entretanto, se ele morrer, seus pontos de mana máximos diminuem em 1 por nível até o fim da aventura. Se perder seu amigo de fé, você pode escolher outro entre os demais personagens no início da próxima aventura.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Artaphan' }]],
    },
    {
      name: 'Pureza Corporal',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para cobrir sua mão com luz e tocar uma criatura em alcance corpo a corpo. A criatura recupera 2d6+2 PV. Além disso, aprende e pode lançar a magia Purificação. Se aprender essa magia novamente, o custo dela diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Caerdellach' }]],
    },
    {
      name: 'Pé na Estrada',
      description:
        'Você pode gastar 3 PM para fornecer o dom da caminhada a criaturas escolhidas em alcance curto. Até o fim da cena, as criaturas afetadas recebem +3m em deslocamento, ficam imunes às condições imóvel e lento e passam automaticamente em testes de Fortitude para marcha forçada (Tormenta20, p. 270).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Laan' }]],
    },
    {
      name: 'Pólvora Sagrada',
      description:
        'Você recebe proficiência com armas de fogo. Além disso, pode gastar 1 PM para abençoar até 10 balas. Até o fim da cena, estas balas fornecem +1 na margem de ameaça e +2 nas rolagens de dano (cumulativo com outros bônus de itens).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Garth' }]],
    },
    {
      name: 'Revoada de Texugos',
      description:
        'Você pode gastar uma ação de movimento e 3 PM para invocar uma revoada de 1d4+1 texugos alados espirituais que ficam ao seu redor até o fim da cena. Enquanto estiverem ao seu redor, os texugos fornecem +2 em rolagens de dano corpo a corpo e na Defesa. Além disso, quando sofre dano, você pode “gastar” um dos texugos alados para receber RD 5 contra esse dano.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tukala' }]],
    },
    {
      name: 'Salto Anurídeo',
      description:
        'Você pode gastar uma ação de movimento e 2 PM para saltar 9m em qualquer direção. Se terminar o salto em alcance corpo a corpo de uma criatura e atacá-la no mesmo turno, você recebe os benefícios e as penalidades de uma investida e sua arma causa um dado extra de dano do mesmo tipo durante esse ataque. Você pode aprender Primor Atlético como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Inghlblhpholstgt' }],
      ],
    },
    {
      name: 'Selo Impedidor',
      description:
        'Você pode gastar uma ação padrão e 3 PM para impedir uma criatura em alcance curto de usar uma habilidade a sua escolha até o fim da cena (Von CD Sab evita). Você só pode escolher uma habilidade que tenha visto a criatura usar ou que tenha identificado com um teste de perícia (como um teste de Misticismo para identificar criatura). Você não pode escolher a habilidade Magias (ou habilidades equivalentes), mas pode escolher uma magia específica. Uma mesma criatura só pode ser afetada por este poder uma vez por cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Dahriol' }]],
    },
    {
      name: 'Selvageria Marcial',
      description:
        'Você pode usar Sobrevivência no lugar de Guerra. Além disso, se passar em um teste para analisar terreno, além das vantagens descobertas, você fornece um bônus de +1 em testes de ataque e rolagens de dano de seus aliados em alcance curto até o fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hurlaagh' }]],
    },
    {
      name: 'Sombras Venenosas',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para envenenar uma arma que esteja usando. A arma causa perda de 1d12 PV por veneno. O veneno dura até você acertar um ataque ou até o fim da cena (o que acontecer primeiro). Além disso, se você estiver em uma área de escuridão, a CD para resistir aos seus venenos aumenta em +2 e a perda de vida deles aumenta em +2 por dado.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Mzzileyn' }]],
    },
    {
      name: 'Sono Reparador',
      description:
        'Se descansar (dormindo) em condições normais ou melhores, você pode melhorar sua recuperação de PV ou PM em um passo. Alternativamente, você pode ter um sonho inspirador: ao despertar, recebe +1d6 em um teste de perícia a sua escolha realizado até o fim do dia.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Neruíte' }]],
    },
    {
      name: 'Toque Esmeralda',
      description:
        'Se fabricar um item que possa receber as melhorias banhado a ouro ou cravejado de joias, você pode gastar T$ 100 para aplicar uma dessas melhorias automaticamente, sem aumento na CD e sem que ela conte como uma melhoria. Sempre que você encontra uma riqueza aleatória (Tormenta20, p. 330), pode rolar duas vezes na tabela e escolher o melhor valor.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Esmeralda' }]],
    },
    {
      name: 'Toque Pestilento',
      description:
        'Você aprende e pode lançar Infligir Ferimentos e, quando você usa essa magia, se o alvo falhar no teste de resistência, ele também é exposto à doença maldição pegajosa (Tormenta20, p. 318) e sofre seu efeito inicial imediadamente. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Luvithy' }]],
    },
    {
      name: 'Trilhas das Árvores Antigas',
      description:
        'Uma vez por rodada, você pode gastar 1 PM para entrar em uma árvore adjacente de tamanho igual ou maior que o seu e sair em outra árvore em alcance longo (também de tamanho igual ou maior que o seu). Você não precisa de linha de visão para a árvore de saída, mas deve estar ciente de sua existência.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Ur' }]],
    },
    {
      name: 'Um Contra Um',
      description:
        'Você pode gastar 2 PM para escolher um oponente em alcance curto e receber +2 em testes de ataque e rolagens de dano contra ele até o fim da cena. Se atacar outro oponente, o bônus termina. Se tiver a habilidade Duelo, em vez disso seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Drumak' }]],
    },
    {
      name: 'Vanglória',
      description:
        'Uma vez por cena, quando faz um teste de perícia, você pode gastar 1 PM para somar +1d6 como um bônus no teste. Se rolar o valor máximo nesse dado de bônus, role um segundo d6 e adicione ao resultado. Você não pode usar esta habilidade em testes de ataque.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Elrophin' }]],
    },
    {
      name: 'Véu de Toris',
      description:
        'Você recebe +5 em Furtividade e não sofre penalidade de armadura em testes dessa perícia. Além disso, você sempre sabe em que direção está Jallar, sendo capaz de encontrar o pequeno reino mesmo com a magia de proteção contra detecção invocada pela deusa.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Toris' }]],
    },
    {
      name: 'Água da Vida',
      description:
        'Uma vez por dia, você pode transformar um jarro (ou outro recipiente equivalente que ocupe 0,5 espaço) de água doce em uma poção mágica. Beber essa água mágica é uma ação padrão e recupera 2d8+2 PV e 1d4+1 PM. A água mantém suas propriedades mágicas por 1 semana ou até ser bebida.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Nerelim' }]],
    },
    {
      name: 'Âmago de Escultor',
      description:
        'Você paga 20% a menos em aposentos e mobílias de bases e construções de domínios. Além disso, pode construir um aposento ou construção acima do limite definido pelo tamanho da base ou nível do domínio.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Granto' }]],
    },
  ],
  [GeneralPowerType.TORMENTA]: [],
  [GeneralPowerType.RACA]: [],
};

export default DEUSES_MENORES_POWERS;
