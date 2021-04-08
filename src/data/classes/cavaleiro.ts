import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const CAVALEIRO: ClassDescription = {
  name: 'Cavaleiro',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.DIPLOMACIA,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.NOBREZA,
      Skill.PERCEPCAO,
      Skill.VONTADE,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.PESADAS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Código de Honra',
      text:
        'Cavaleiros distinguem-se de meros combatentes por seguir um código de conduta. Fazem isto para mostrar que estão acima dos mercenários e bandoleiros que infestam os campos de batalha. Você não pode atacar um oponente pelas costas (em termos de jogo, não pode se beneficiar do bônus de flanquear), caído, desprevenido ou incapaz de lutar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia. Rebaixar-se ao nível dos covardes e desesperados abala a autoconfiança que eleva o cavaleiro.',
      nivel: 1,
    },
    {
      name: 'Baluarte',
      text:
        'Você pode gastar 1 PM para receber +2 na Defesa e nos testes de resistência até o início do seu próximo turno. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +2.',
      nivel: 1,
    },
    {
      name: 'Duelo',
      text:
        'Você pode gastar 2 PM para escolher um inimigo em alcance curto e receber +1 em testes de ataque e rolagens de dano contra ele até o fim da cena. Se atacar outro inimigo, o bônus termina. Para cada 2 PM extras que você gastar, o bônus aumenta em +1.',
      nivel: 2,
    },
    {
      name: 'Caminho do Cavaleiro',
      text:
        'Escolha entre Bastião ou Montaria. Bastião: Se estiver usando armadura pesada, você recebe resistência a dano 5 (cumulativa com a RD fornecida por Especialização em Armadura). Montaria: Você recebe um cavalo de guerra com o qual possui +5 em testes de Adestramento e Cavalgar. Ele fornece os benefícios de um aliado iniciante de seu tipo. No 11º nível, passa a fornecer os benefícios de um aliado veterano e, no 17º nível, de um aliado mestre. De acordo com o mestre, você pode receber outro tipo de montaria. Veja a lista de aliados no Capítulo 6: O Mestre. Caso a montaria morra, você pode comprar outra pelo preço normal e treiná-la para receber os benefícios deste poder com uma semana de trabalho.',
      nivel: 5,
    },
    {
      name: 'Resoluto',
      text:
        'Você pode gastar 1 PM para refazer um teste de resistência contra uma condição (como abalado, paralisado etc.) que esteja o afetando. O segundo teste recebe um bônus de +5 e, se você passar, cancela o efeito. Você só pode usar esta habilidade uma vez por efeito.',
      nivel: 11,
    },
    {
      name: 'Bravura Final',
      text:
        'Sua virtude vence a morte. Se for reduzido a 0 ou menos PV, você pode continuar consciente e agindo normalmente. Se fizer isso, deve gastar 5 PM no início de cada um de seus turnos. Caso contrário, cai inconsciente ou morto, conforme seus PV atuais.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Armadura da Honra',
      text:
        'No início de cada cena, você recebe uma quantidade de pontos de vida temporários igual a 5 + seu bônus de Carisma. Os PV temporários duram até o final da cena.',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha. Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Autoridade Feudal',
      text:
        'Você possui autoridade sobre pessoas comuns (qualquer pessoa sem um título de nobreza ou uma posição numa igreja reconhecida pelo Reinado). Você pode gastar 2 PM para conclamar o povo a realizar uma tarefa para você. Em termos de jogo, passa automaticamente em um teste de perícia com CD máxima igual ao seu nível +5. O tempo necessário para conclamar o povo é o tempo do uso da perícia em questão. Esta habilidade só pode ser usada em locais onde sua posição carregue alguma influência (a critério do mestre).',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Desprezar os Covardes',
      text:
        'Você recebe resistência a dano 5 se estiver caído, desprevenido ou flanqueado.',
      requirements: [],
    },
    {
      name: 'Escudeiro',
      text:
        'Você recebe os serviços de um escudeiro, um aliado especial que cuida de seu equipamento. Suas armas recebem um bônus de +1 em rolagens de dano e sua armadura concede +1 em Defesa. Além disso, você pode pagar 1 PM para receber ajuda do escudeiro em combate. Você recebe uma ação de movimento que pode usar para se levantar, sacar um item ou trazer sua montaria. O escudeiro não conta em seu limite de aliados. Caso ele morra, você pode treinar outro com um mês de trabalho.',
      requirements: [],
    },
    {
      name: 'Especialização em Armadura',
      text:
        'Se estiver usando armadura pesada, você recebe resistência a dano 5 (cumulativa com a RD fornecida por Bastião).',
      requirements: [[{ type: RequirementType.NIVEL, value: 12 }]],
    },
    {
      name: 'Estandarte',
      text:
        'Sua flâmula torna-se célebre, um símbolo de inspiração para seus aliados. No início de cada cena, você e todos os aliados que possam ver seu estandarte recebem um número de PM temporários igual ao seu bônus de Carisma (mínimo 1). PM temporários desaparecem no final da cena.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Título' },
          { type: RequirementType.NIVEL, value: 14 },
        ],
      ],
    },
    {
      name: 'Etiqueta',
      text:
        'Você pode gastar 1 PM para rolar novamente um teste recém realizado de Diplomacia ou Nobreza.',
      requirements: [],
    },
    {
      name: 'Investida Destruidora',
      text:
        'Quando faz a ação investida, você pode gastar 2 PM. Se fizer isso, causa +2d8 pontos de dano. Você deve usar esta habilidade antes de rolar o ataque.',
      requirements: [],
    },
    {
      name: 'Montaria Corajosa',
      text:
        'Sua montaria concede +1d6 em rolagens de dano corpo a corpo (cumulativo com qualquer bônus que ela já forneça como aliado).',
      requirements: [[{ type: RequirementType.PODER, name: 'Montaria' }]],
    },
    {
      name: 'Pajem',
      text:
        'Você recebe os serviços de um pajem, um aliado especial que o auxilia em pequenos afazeres. Você recebe +2 em Diplomacia, por estar sempre aprumado, e sua recuperação de PV e PM aumenta em +1 por nível, por estar sempre confortável. O pajem pode executar pequenas tarefas, como entregar mensagens e comprar itens, e não conta em seu limite de aliados. Caso ele morra, você pode treinar outro com uma semana de trabalho.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Aríete Implacável',
      text:
        'Ao assumir esta postura, você aumenta o bônus de ataque em investidas em +2. Para cada 2 PM adicionais que gastar quando assumir a postura, aumenta o bônus de ataque em +1. Além disso, se fizer uma investida contra um objeto, causa +2d8 de dano. Você precisa se deslocar todos os turnos para manter esta postura ativa.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Castigo de Ferro',
      text:
        'Sempre que um aliado adjacente sofrer um ataque corpo a corpo, você pode gastar 1 PM para fazer um ataque na criatura que o atacou como uma reação.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Foco de Batalha',
      text:
        'Sempre que um inimigo atacá-lo, você recebe 1 PM temporário. Pontos de mana temporários desaparecem no final da cena.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Muralha Intransponível.',
      text:
        'Para assumir esta postura você precisa estar empunhando um escudo. Você recebe +1 na Defesa e em Reflexos. Além disso, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, não sofre nenhum dano se passar. Para cada 2 PM adicionais que gastar quando assumir a postura, aumenta esse bônus em +1. Por fim, enquanto mantiver esta postura, seu deslocamento é reduzido para 3m.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Provocação Petulante',
      text:
        'Enquanto esta postura estiver ativa, todos os inimigos que iniciarem seus turnos dentro de seu alcance curto devem fazer um teste de Vontade (CD Car). Se falharem, devem atacar você nessa rodada.',
      requirements: [],
    },
    {
      name: 'Postura de Combate: Torre Inabalável',
      text:
        'Você assume uma postura defensiva que o torna imune a qualquer tentativa de tirá-lo do lugar, de forma mundana ou mágica. Enquanto mantiver a postura, você não pode se deslocar, mas recebe um bônus na Defesa igual a seu bônus de Constituição e pode substituir testes de Reflexos e Vontade por testes de Fortitude.',
      requirements: [],
    },
    {
      name: 'Solidez',
      text:
        'Se estiver usando um escudo, você aplica o bônus na Defesa recebido pelo escudo em testes de resistência.',
      requirements: [],
    },
    {
      name: 'Título',
      text:
        'Você adquire um título de nobreza. Converse com o mestre para definir os benefícios exatos de seu título. Como regra geral, você recebe 10 TO por nível de cavaleiro no início de cada aventura (rendimentos dos impostos) ou a ajuda de um aliado veterano (um membro de sua corte).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Autoridade Feudal' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Torre Armada',
      text:
        'Quando um inimigo erra um ataque contra você, você pode gastar 1 PM. Se fizer isso, recebe +5 em rolagens de dano contra esse inimigo até o fim de seu próximo turno.',
      requirements: [],
    },
  ],
  probDevoto: 0.5,
  faithProbability: {
    ARSENAL: 1,
    AZGHER: 1,
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LINWU: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO],
};

export default CAVALEIRO;
