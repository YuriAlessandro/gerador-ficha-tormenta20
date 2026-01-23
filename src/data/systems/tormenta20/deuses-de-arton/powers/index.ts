import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { SKILLS_WITHOUT_OFICIO_QUALQUER } from '../../pericias';

const DEUSES_ARTON_POWERS: { [key in GeneralPowerType]: GeneralPower[] } = {
  [GeneralPowerType.COMBATE]: [],
  [GeneralPowerType.DESTINO]: [],
  [GeneralPowerType.MAGIA]: [],
  [GeneralPowerType.CONCEDIDOS]: [
    {
      name: 'Abraço da Fênix',
      description:
        'Você se torna imune a fogo. Se fosse sofrer dano mágico de fogo, em vez disso cura PV em quantidade igual à metade desse dano (se já faz isso por outro efeito, cura a quantidade completa).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Thyatis' }]],
    },
    {
      name: 'Adaga Noturna',
      description:
        'Você pode gastar 1 PM para fazer uma arma de perfuração que esteja usando causar +1d6 pontos de dano de frio até o fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
    },
    {
      name: 'A Ferramenta Certa',
      description:
        'Você pode gastar 1 PM para fazer uma ferramenta ou um equipamento de aventura de até T$ 400 aparecer na sua mão ou em um espaço adjacente. O item dura até o fim da cena, ou até deixar sua posse.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hyninn' }]],
    },
    {
      name: 'Alimentar-se do Pavor',
      description:
        'Quando uma criatura em alcance curto sob efeito de uma condição de medo morre, você recebe pontos de vida temporários iguais ao dobro do seu ND, que duram até o fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }],
        [{ type: RequirementType.DEVOTO, name: 'Megalokk' }],
      ],
    },
    {
      name: 'Alma de Mudança',
      description:
        'No início de cada aventura, você pode trocar uma quantidade de poderes (limitada por sua Sabedoria) por poderes diferentes cujos pré-requisitos cumpra. Você não pode trocar este poder.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Thwor' }],
        [{ type: RequirementType.DEVOTO, name: 'Valkaria' }],
      ],
    },
    {
      name: 'Andarilho Carregado',
      description:
        'Sua mochila de aventureiro não conta no seu limite de itens vestidos e, se estiver vestindo uma dessas mochilas, você pode usar Sabedoria para estabelecer seu limite de carga (em vez de Força). A critério do mestre, este poder pode ser aplicado a outro item equivalente (como uma mochila de carga).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Valkaria' }]],
    },
    {
      name: 'Armadilha Divina',
      description:
        'Você recebe um poder de Armadilha do caçador a sua escolha. Por ser criada a partir de energia divina, essa armadilha pode ser preparada em locais sem os materiais propícios.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hyninn' }]],
    },
    {
      name: 'Armadura de Ossos',
      description:
        'Você pode gastar uma ação de movimento e 2 PM para receber +2 na Defesa e em Intimidação, e redução de corte, frio e trevas 5 até o fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
    },
    {
      name: 'Armas da Destruição',
      description:
        'Você recebe +1 nas rolagens de dano e no multiplicador de crítico com armas nas quais é proficiente.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Armas da Destruição' },
          target: { type: 'WeaponDamage', proficiencyRequired: true },
          modifier: { type: 'Fixed', value: 1 },
        },
        {
          source: { type: 'power', name: 'Armas da Destruição' },
          target: { type: 'WeaponCritical', proficiencyRequired: true },
          modifier: { type: 'Fixed', value: 1 },
        },
      ],
    },
    {
      name: 'Armas da Selvageria',
      description:
        'Para você, armas naturais são armas favoritas de Megalokk. Você recebe +2 em rolagens de dano com elas, pode usar Abençoar Arma nelas e, quando usa esse poder ou a magia Armamento da Natureza, pode aplicar seus benefícios a todas as suas armas naturais (sem custo adicional).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Megalokk' }]],
    },
    {
      name: 'Aventureiro Inquieto',
      description:
        'Uma vez por busca, você pode rolar novamente um teste recém-realizado (mas deve aceitar o novo resultado) e, quando recebe uma recompensa ou um castigo aleatório por uma busca (incluindo rolagens na Tabela 8-1), rola dois dados e escolhe entre os dois resultados.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Valkaria' }]],
    },
    {
      name: 'Baforada Dracônica',
      description:
        'Escolha um elemento entre ácido, eletricidade, fogo, frio, luz ou trevas (uma vez feita, essa escolha não pode ser mudada). Uma vez por rodada, você pode gastar PM (limitados por sua Constituição) para desferir um sopro elemental em uma criatura em alcance curto. Para cada PM que você gastar, o alvo sofre 1d10 pontos de dano do tipo escolhido (Reflexos CD Con reduz à metade). Recarga (movimento).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
    },
    {
      name: 'Barreira de Coral',
      description:
        'Você pode gastar uma ação de movimento e 3 PM para cobrir seu corpo de coral. Até o fim da cena, você recebe +5 na Defesa e, sempre que sofrer um ataque corpo a corpo, o atacante sofre dano de perfuração igual a 1d6 + sua Constituição. Para cada patamar acima de iniciante, esse dano aumenta em +1d6.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    },
    {
      name: 'Belo Presente',
      description:
        'Uma vez por cena, você pode pedir a Wynna o conhecimento de uma magia que tenha visto sendo lançada nessa aventura e que seja de um círculo a que você tenha acesso. Gaste uma ação padrão e faça um teste de Religião (CD 15 + custo em PM da magia). Se passar, você pode lançar essa magia até o fim do seu próximo turno (pagando seus custos normais).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
    },
    {
      name: 'Biblioteca Divina',
      description:
        'Você recebe uma perícia treinada. A cada patamar de jogo acima de iniciante, recebe mais uma perícia treinada.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
      sheetActions: [
        {
          source: { type: 'power', name: 'Biblioteca Divina' },
          action: {
            type: 'learnSkill',
            availableSkills: SKILLS_WITHOUT_OFICIO_QUALQUER,
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Cancioneiro da Esperança',
      description:
        'Você pode gastar uma ação padrão e 2 PM para entoar uma canção de superação e paz. Criaturas escolhidas (limitadas por seu Carisma) em alcance curto recebem +2 em testes (exceto testes de ataque) e +3m de deslocamento até o fim da cena. Se uma criatura afetada for executar uma ação hostil, perde esses bônus.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    },
    {
      name: 'Cerimonialista Divino',
      description:
        'Uma vez por dia, você pode gastar 1 hora para executar uma cerimônia tradicional que afeta até 1 + seu Carisma criaturas por 1 dia. Faça um teste de Religião com um bônus igual ao seu Carisma. Para cada 10 pontos do resultado, cada criatura afetada recebe um dado de auxílio. Quando faz um teste de atributo ou perícia (exceto Enganação, Furtividade e Ladinagem), a criatura pode gastar um deles para receber +1d6 de bônus no teste. Para criaturas que gastarem T$ 25 em oferendas no ritual, esse bônus muda para +1d8.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    },
    {
      name: 'Chamado Monstruoso',
      description:
        'Você aprende e pode lançar Conjurar Monstro e pode lançar e sustentar essa magia sem violar suas Obrigações & Restrições. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Megalokk' }]],
    },
    {
      name: 'Companheiro Celeste',
      description:
        'Você possui um luminar que o acompanha como um parceiro iniciante. Se perder esse luminar, você pode receber outro com uma cerimônia que exige 1 dia e T$ 100 em oferendas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Lena' }],
        [{ type: RequirementType.DEVOTO, name: 'Marah' }],
      ],
    },
    {
      name: 'Companheiro Silvestre',
      description:
        'Você possui um espírito da natureza que o acompanha como um parceiro perseguidor iniciante. Alternativamente, se você tiver o suplemento Ameaças de Arton, pode receber um bogum iniciante. Se perder esse parceiro, você pode receber outro com uma cerimônia que exige 1 dia e T$ 100 em oferendas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    },
    {
      name: 'Convicção Ambiciosa',
      description:
        'Quando luta em desvantagem (um encontro contra o dobro de inimigos que seu grupo, ou com ND maior que o do grupo), você recebe +2 em testes de perícia até o fim da cena. Além disso, se houver um ou mais inimigos de ND igual ou maior que seu nível, você recebe uma ação padrão extra em seu primeiro turno de combate.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Valkaria' }]],
    },
    {
      name: 'Corromper Equipamento',
      description:
        'Você pode gastar 2 PM para cobrir uma arma, um escudo ou um esotérico que esteja empunhando com carapaça quitinosa. Até o fim da cena, o item recebe os benefícios de matéria vermelha, cumulativo com outros materiais especiais. Se usar este poder em uma arma produzida com Armamento Aberrante, seu custo é reduzido em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
    },
    {
      name: 'Curar o Espírito',
      description:
        'Você pode gastar uma ação completa para inspirar esperança em uma criatura que possa tocar. Faça um teste de Carisma (CD 10). Se você passar, a criatura recupera 1d4+1 PM. Você só pode usar este poder uma vez por dia numa mesma criatura.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lena' }]],
    },
    {
      name: 'Discurso Conciliador',
      description:
        'Quando faz um teste de Diplomacia para mudar atitude, você pode rolar dois dados e usar o melhor resultado ou ambos (como se tivesse usado mudar atitude duas vezes). Se passar em ambos, as mudanças de atitude são cumulativas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    },
    {
      name: 'Dom da Furtividade',
      description:
        'Você soma sua Sabedoria em Furtividade e, para você, lançar magias é um ato pouco chamativo, o que reduz a penalidade para se esconder após conjurar para –10 (mas você ainda precisa de gestos e palavras).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Hyninn' }]],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Dom da Furtividade' },
          target: { type: 'Skill', name: Skill.FURTIVIDADE },
          modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
        },
      ],
    },
    {
      name: 'Dom da Vontade',
      description:
        'Você recebe +2 em Vontade e, uma vez por cena, quando passa em um teste de Vontade contra um efeito de um inimigo ou de um perigo apresentado pelo mestre, recebe 1d4 PM temporários.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Dom da Vontade' },
          target: { type: 'Skill', name: Skill.VONTADE },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Dom dos Segredos',
      description:
        'Você pode gastar uma ação padrão e 2 PM para suplicar a Sszzaas por um segredo místico. Faça um teste de Carisma (CD 10, +2 para cada vez que usou este poder no mesmo dia). Se passar, você aprende e pode lançar uma magia de 1º círculo até o fim da cena (atributo-chave Car ou o seu atributo de conjuração, se houver).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
    },
    {
      name: 'Égide dos Mares',
      description:
        'Você possui um espírito das águas que o acompanha como um parceiro guardião iniciante. Alternativamente, se você tiver o suplemento Ameaças de Arton, pode receber um escudeiro iniciante. Em ambos os casos, se perder esse parceiro, você pode receber outro com uma cerimônia que exige 1 dia e T$ 100 em oferendas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    },
    {
      name: 'Espalhar a Corrupção',
      description:
        'Quando chega em uma comunidade, você pode gastar um dia e fazer um teste de Religião (CD 20). Se passar, você planta a semente da corrupção no coração das pessoas em uma área equivalente a uma aldeia, um castelo ou um bairro de uma cidade grande. Por uma semana, ou até você partir do lugar, a categoria de atitude dessas pessoas em relação umas às outras piora em um passo, à medida que o senso moral delas se deteriora e seus piores desejos vêm à tona.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
    },
    {
      name: 'Espírito Animal',
      description:
        'Você pode gastar uma ação de movimento e 2 PM para conjurar um espírito animal que o envolve e luta com você. Até o fim da cena, você não pode ser flanqueado e recebe 10 PV temporários e uma arma natural (dano 1d6, crítico x2, tipo a sua escolha entre corte, impacto ou perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com essa arma. Quando usa este poder, você pode gastar PM adicionais (custo total limitado por sua Sabedoria). Para cada PM adicional, os PV temporários aumentam em +5.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    },
    {
      name: 'Espírito do Conhecimento',
      description:
        'Você pode gastar uma ação padrão e 2 PM para invocar uma manifestação do saber em um espaço desocupado em alcance curto. Ela é um espírito Minúsculo que tem deslocamento de voo 6m, Força nula, Defesa 15, 1 PV, visão no escuro e falha em qualquer teste oposto. No início de seus turnos, ela pode usar a ação movimentar-se uma vez. Você pode perceber tudo que a manifestação for capaz de perceber e pode lançar magias a partir dela (exceto magias de alcance pessoal com alvo você). A manifestação desaparece quando morre ou no fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    },
    {
      name: 'Estouro da Trobada',
      description:
        'Você pode gastar uma ação completa e 2 PM para convocar uma manada de trobos (ou outro animal da região) em um ponto desocupado a sua escolha em alcance curto com duração sustentada. A manada é Enorme e pode passar pelo espaço de outras criaturas. Você pode gastar uma ação de movimento para mover a manada 12m em linha reta. Criaturas pelas quais ela passar sofrem 3d6 pontos de dano de impacto e ficam caídas (Fort CD Sab reduz à metade e evita a condição).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    },
    {
      name: 'Exaltar Honra',
      description:
        'Você pode gastar 2 PM para gerar uma aura de honradez de 9m de raio que dura até o fim da cena. Dentro dessa área, devotos de Lin-Wu e personagens que sigam algum código de conduta (como Código de Honra ou Código do Herói) recebem +5 em Diplomacia e Nobreza, e todas as criaturas na área sofrem –5 em perícias desonradas (Enganação, Furtividade e Ladinagem). Apenas personagens com a habilidade Abençoado ou Devoto Fiel podem escolher este poder.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    },
    {
      name: 'Expurgar a Derrota',
      description:
        'Se estiver com 0 PM, você pode gastar seus pontos de vida (exceto PV temporários) no lugar de mana, à taxa de 3 PV por 1 PM. Você não pode reduzir seus PV a 0 ou menos dessa forma e não pode usar este poder se estiver sob efeito de ter descumprido suas Obrigações & Restrições. Pontos de vida gastos dessa forma só podem ser recuperados com descanso.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
    },
    {
      name: 'Familiar Elemental',
      description:
        "Você possui um espírito arcano que o acompanha como um familiar com as habilidades de um adepto iniciante. Alternativamente, se você tiver o suplemento Ameaças de Arton, pode receber um familiar elemental iniciante, escolhido entre aquin'ne, t'peel, pakk ou terrier. Em ambos os casos, se perder esse parceiro, você pode receber outro com uma cerimônia que exige 1 dia e T$ 100 em oferendas.",
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
    },
    {
      name: 'Ferramentas da Guerra',
      description:
        'Uma vez por dia, você pode gastar 1 hora e T$ 10 por item para abençoar uma quantidade de itens limitada por sua Sabedoria. Armas abençoadas dessa forma fornecem +2 em rolagens de dano, e armaduras e escudos fornecem RD 2. Se o usuário de um item abençoado for derrotado em combate, o item é destruído. Os efeitos da bênção duram 1 dia.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
    },
    {
      name: 'Golpe Semântico',
      description:
        'Você pode substituir testes de Diplomacia e Intimidação por Conhecimento.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    },
    {
      name: 'Golpe Tempestuoso',
      description:
        'Quando acerta um ataque corpo a corpo, você pode gastar 2 PM. Se fizer isso, a criatura é empurrada 3m em uma direção a sua escolha e fica desprevenida por 1 rodada.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    },
    {
      name: 'Imolação Sagrada',
      description:
        'Você pode gastar uma ação padrão e 1 PM para cobrir seus braços com chamas com duração sustentada. Nesse estado, seus ataques corpo a corpo causam +1d6 pontos de dano de fogo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Azgher' }],
        [{ type: RequirementType.DEVOTO, name: 'Thyatis' }],
      ],
    },
    {
      name: 'Júbilo na Dor',
      description:
        'Quando causa ou sofre dano, você recebe redução de dano 1. Esse efeito é cumulativo e limitado por sua Sabedoria e termina se você passar 1 rodada sem causar ou sofrer dano.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
    },
    {
      name: 'Jurista Divino',
      description:
        'Você pode usar Sabedoria para Nobreza (em vez de Inteligência) e pode usar essa perícia no lugar de Diplomacia e Intimidação.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }],
        [{ type: RequirementType.DEVOTO, name: 'Khalmyr' }],
      ],
    },
    {
      name: 'Magia Caótica',
      description:
        'Quando lança uma magia, você pode gastar +2 PM. Se fizer isso, a CD para resistir a essa magia é calculada com 1d20 + seus modificadores, em vez de 10 + seus modificadores.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
    },
    {
      name: 'Magia Piedosa',
      description:
        'Quando lança uma magia que causa dano, você pode fazer com que ela cause dano não letal.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Lena' }],
        [{ type: RequirementType.DEVOTO, name: 'Thyatis' }],
      ],
    },
    {
      name: 'Magia Venenosa',
      description:
        'Suas magias com resistência Fortitude recebem o seguinte aprimoramento. +1 PM: além do normal, criaturas que falharem perdem 1d12 PV por veneno, ou 1d6 se passarem na resistência.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
    },
    {
      name: 'Manto Ardiloso',
      description:
        'Você aprende a magia Disfarce Ilusório (CD Car). Na primeira vez que interage com alguém enquanto está sob efeito dessa magia, você recebe +10 no teste de Diplomacia para mudar a atitude dela. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
    },
    {
      name: 'Mar Revolto',
      description:
        'Você pode gastar 1 PM para gerar uma aura de 6m de raio com duração sustentada. No início de seus turnos, criaturas a sua escolha na área devem passar em um teste de Acrobacia (CD Sab, +5 se a criatura estiver dentro da água) para não cair.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    },
    {
      name: 'Mediador da Tempestade',
      description:
        'Você pode se comunicar com lefeu inteligentes (Int –3 ou maior) livremente e recebe +5 em testes de Diplomacia e Intuição com criaturas da Tormenta e devotos de Aharadak.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
    },
    {
      name: 'Mestre de Si',
      description:
        'Você passa automaticamente no primeiro teste de Vontade contra um efeito de um inimigo que fizer a cada cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    },
    {
      name: 'Mordida de Víbora',
      description:
        'Você recebe uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Suas presas são retráteis e podem armazenar até 2 doses de veneno de contato. Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Se acertar, pode inocular uma das doses de veneno no alvo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
    },
    {
      name: 'Navegador Sagrado',
      description:
        'Você pode usar Sabedoria para Pilotagem (em vez de Destreza) e, enquanto estiver em uma embarcação aquática, suas magias divinas custam –2 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    },
    {
      name: 'Nimb',
      description:
        'Você é Nimb. Ou um filho ou filha dele. Ou uma casca de banana na qual ele escorregou certa vez. Você pode gastar uma ação padrão e 2 PM para gerar uma habilidade única. Para isso, role 1d6 em cada coluna da tabela da página 46 do Deuses de Arton.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
    },
    {
      name: 'O Dobro ou Nada',
      description:
        'Quando usa uma habilidade com custo em PM, você pode pagar o dobro desse custo (após aplicar efeitos que alterem o custo) para aumentar a CD da habilidade em +5. Se pelo menos um alvo passar no teste de resistência, você fica alquebrado. Este poder não pode ser usado em magias, incluindo simuladas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Hyninn' }],
        [{ type: RequirementType.DEVOTO, name: 'Nimb' }],
      ],
    },
    {
      name: 'O Futuro que Vier Disso',
      description:
        'Quando faz um teste, você pode rolar um dado a sua escolha (d4 a d20) e somar o resultado a esse teste. Quando você faz isso, o mestre recebe um dado do mesmo tipo, que pode gastar para aplicar como penalidade em um de seus testes até o fim da próxima sessão. Você não pode usar este poder novamente na mesma sessão até que o mestre use o dado que recebeu.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Thwor' }]],
    },
    {
      name: 'O Sol que nos Aquece',
      description:
        'Você pode gastar uma ação padrão e 2 PM para projetar uma aura de luz solar em um raio de 6m. Nessa área, habilidades mágicas de fogo ou luz e relacionadas a plantas (como Controlar Plantas) custam –1 PM (cumulativo com outras reduções) e criaturas com sensibilidade a luz e mortos-vivos ficam vulneráveis.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Allihanna' }],
        [{ type: RequirementType.DEVOTO, name: 'Azgher' }],
      ],
    },
    {
      name: 'Palavra de Poder',
      description:
        'Você aprende e pode lançar Comando. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    },
    {
      name: 'Passo Sombrio',
      description:
        'Uma vez por rodada, você pode gastar 2 PM para se teleportar para um espaço desocupado em alcance curto. Se tanto você quanto esse espaço estiverem sob escuridão, o custo deste poder diminui em –1 PM. Você não pode usar este poder se estiver imóvel.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
    },
    {
      name: 'Perceber Farsas',
      description:
        'Você recebe +5 em Intuição e se torna imune a efeitos de ilusão.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Perceber Farsas' },
          target: { type: 'Skill', name: Skill.INTUICAO },
          modifier: { type: 'Fixed', value: 5 },
        },
      ],
    },
    {
      name: 'Pilar de Heredrimm',
      description:
        'Você pode gastar 2 PM para receber +2 na Defesa e redução de dano 5 até o fim da cena ou até encerrar este poder (uma ação livre). Enquanto esse efeito estiver ativo, seu deslocamento é reduzido à metade.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
    },
    {
      name: 'Poder do Vínculo',
      description:
        'Você pode gastar uma ação de movimento e uma quantidade de PM (limitada ao círculo de magias a que tem acesso) para tocar em uma criatura capaz de lançar magias. O custo em PM da próxima magia que ela lançar diminui em um valor igual aos PM que você gastou.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
    },
    {
      name: 'Poder Sem Limites',
      description:
        'A CD e os limites de PM de suas habilidades (exceto magias e habilidades que as simulem) aumentam em um valor igual ao seu patamar.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
    },
    {
      name: 'Proeminência Solar',
      description:
        'Suas magias que causam dano de fogo e que têm um teste de resistência recebem o seguinte aprimoramento: +1 PM: criaturas que falhem na resistência ficam em chamas e lentas até apagarem as chamas.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
    },
    {
      name: 'Quebrar Encanto',
      description:
        'Você recebe +2 em testes de ataque para quebrar. Quando usa essa manobra, você pode gastar 2 PM. Se você acertar o ataque, o item e seu portador sofrem o efeito de Dissipar Magia, usando o resultado do teste de quebrar como teste de Misticismo e CD para resistir.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
    },
    {
      name: 'Redirecionar Destino',
      description:
        'No início de cada dia, role um d20 e anote seu valor. Uma vez por rodada, quando uma criatura em alcance curto faz um teste, você pode gastar 3 PM para substituir o resultado do d20 desse teste pelo último valor anotado para este poder. O resultado do d20 substituído se torna seu novo valor anotado.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Thyatis' }]],
    },
    {
      name: 'Remorso do Belicista',
      description:
        'Uma vez por rodada, quando sofre dano de um inimigo, você pode gastar 1 PM. Se fizer isso, ele sofre uma penalidade cumulativa de –2 em testes de ataque e rolagens de dano até o fim da cena. Mental.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    },
    {
      name: 'Resplendor Divino',
      description:
        'Você pode gastar 2 PM para gerar uma aura de luz solar com 9m de raio que dura até o fim da cena. Além de sofrer os efeitos de exposição à luz, criaturas dentro da aura perdem toda camuflagem por escuridão e efeitos semelhantes (como da cobertura de sombras do aprimoramento da magia Escuridão).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
    },
    {
      name: 'Saque Celestial',
      description:
        'Você pode gastar 1 PM para sacar ou guardar uma arma como uma ação livre. Se sacar sua arma e fizer um ataque corpo a corpo no mesmo turno, você recebe +2 nesse teste de ataque e seu dano aumenta em dois passos (apenas uma vez contra cada criatura por cena).',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    },
    {
      name: 'Só os Loucos Sabem',
      description:
        'Role duas perícias na Tabela 6-6 (Tormenta20, p. 279). Você se torna treinado nelas (se já for, recebe +3 nessa perícia). No começo de cada dia, você pode gastar 3 PM para rolar novas perícias.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
    },
    {
      name: 'Sorvo de Mana',
      description:
        'Sempre que falhar no teste de resistência contra uma magia de um inimigo, você recupera uma quantidade de PM igual ao círculo dela.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
    },
    {
      name: 'Temor Arcano',
      description:
        'Quando um inimigo em alcance médio sob efeito de uma condição de medo falha em um teste de resistência contra uma de suas magias, você recebe 1 PM temporário cumulativo. Você pode ganhar um máximo de PM temporários por cena igual ao seu nível, e eles desaparecem no fim da cena.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
    },
    {
      name: 'Terror Profundo',
      description:
        'Você recebe +2 em Intimidação e na CD de seus efeitos de medo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }],
        [{ type: RequirementType.DEVOTO, name: 'Megalokk' }],
        [{ type: RequirementType.DEVOTO, name: 'Thwor' }],
      ],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Terror Profundo' },
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Toque de Não Vida',
      description:
        'Você pode gastar uma ação de movimento e 2 PM para fornecer a si mesmo ou a uma criatura adjacente 2d12 PV temporários (que são sempre os primeiros a serem perdidos) e, enquanto os PV temporários durarem, camuflagem leve.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
    },
    {
      name: 'Transbordar Cura',
      description:
        'Quando você usa um efeito de cura, quaisquer pontos de vida excedentes desse efeito se tornam pontos de vida temporários, até um valor máximo igual ao dobro do nível do alvo.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Lena' }]],
    },
    {
      name: 'Trilha Desimpedida',
      description:
        'Você aprende e pode lançar a magia Caminhos da Natureza. Se aprender essa magia, o custo dela diminui em –1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    },
    {
      name: 'Ushultt',
      description:
        'Escolha um de seus aliados como seu ushultt. Enquanto estiverem em alcance curto um do outro, vocês recebem +2 em testes de ataque e rolagens de dano (esse bônus aumenta para +3 se o ushultt também for duyshidakk). Você pode trocar seu ushultt uma vez por aventura.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Thwor' }]],
    },
    {
      name: 'Vitória a Qualquer Custo',
      description:
        'Quando faz um teste de ataque, de resistência ou de Guerra, você pode gastar 2 PM para rolar novamente esse teste. Você pode fazer isso várias vezes no mesmo teste, mas cada novo uso aumenta o custo em +1 PM.',
      type: GeneralPowerType.CONCEDIDOS,
      requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
    },
  ],
  [GeneralPowerType.TORMENTA]: [],
  [GeneralPowerType.RACA]: [],
};

export default DEUSES_ARTON_POWERS;
