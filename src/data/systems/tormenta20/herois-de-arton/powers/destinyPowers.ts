import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Destino do suplemento Heróis de Arton
 */
const destinyPowers: Record<string, GeneralPower> = {
  ALMA_LIVRE: {
    name: 'Alma Livre',
    description:
      'Arton tem muitas maravilhas a serem exploradas, muitos caminhos a serem percorridos — e você não é louco de se prender a um só. Escolha uma classe. Você pode escolher um poder dessa classe como se pertencesse a ela (para efeitos de nível na classe desse poder, considere seu nível de personagem −4). Note que você não recebe o poder, apenas o direito de escolhê-lo mais tarde.',
    type: GeneralPowerType.DESTINO,
    requirements: [],
  },
  ANDARILHO_URBANO: {
    name: 'Andarilho Urbano',
    description:
      'Nas tavernas mais sujas e nos becos mais escuros... você está em casa. Se estiver em uma cidade, você recebe +2 na Defesa, em Enganação e em Investigação.',
    type: GeneralPowerType.DESTINO,
    requirements: [],
  },
  CARICIAS_REVIGORANTES: {
    name: 'Carícias Revigorantes',
    description:
      'Você sabe como aliviar as dores e tristezas de uma pessoa. Você pode gastar 1 minuto e 2 PM para recuperar 2d4 PM de uma criatura adjacente. Uma mesma criatura só pode receber os benefícios deste poder uma vez por dia.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 2 },
        { type: RequirementType.PODER, name: 'Sedução Lasciva' },
      ],
    ],
  },
  DILIGENTE: {
    name: 'Diligente',
    description:
      'Você pode gastar uma ação de movimento para se concentrar na tarefa à frente. Se fizer isso, recebe +2 em um teste de perícia (exceto testes de ataque) que exija no máximo uma ação completa para ser realizado e que seja realizado até o fim do seu próximo turno.',
    type: GeneralPowerType.DESTINO,
    requirements: [],
  },
  FOCO_EM_HABILIDADE: {
    name: 'Foco em Habilidade',
    description:
      'Escolha uma habilidade. A CD para resistir a essa habilidade aumenta em +2. Você pode escolher este poder outras vezes para habilidades diferentes. Este poder não pode ser aplicado a magias (mas veja Foco em Magia e Especialização em Magia).',
    type: GeneralPowerType.DESTINO,
    requirements: [],
    canRepeat: true,
  },
  GRANDAO: {
    name: 'Grandão',
    description:
      'Você conta como uma categoria de tamanho maior para propósitos do modificador de Furtividade e manobras, espaço ocupado e alcance natural. Além disso, sua capacidade de carga aumenta em 5 espaços.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Constituição', value: 2 }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Grandão' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  HEROI_DOS_SETE_INSTRUMENTOS: {
    name: 'Herói dos Sete Instrumentos',
    description:
      'Você aprendeu de tudo um pouco e um pouco de tudo. Você recebe um bônus de +1 em testes de perícias nas quais não é treinado. No 7º nível esse bônus aumenta para +2 e, no 15º nível, aumenta para +3.',
    type: GeneralPowerType.DESTINO,
    requirements: [],
  },
  IMPOSTOR: {
    name: 'Impostor',
    description:
      'Graças a seu extremo charme e autoconfiança, você consegue convencer outras pessoas — e você mesmo! — de que tem certas habilidades que, na verdade, não possui. Uma vez por cena, quando faz um teste de perícia que exija no máximo uma ação completa para ser realizado, você pode gastar 2 PM para usar Enganação no lugar dessa perícia.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 3 },
        { type: RequirementType.PODER, name: 'Foco em Perícia (Enganação)' },
      ],
    ],
  },
  LIDERANCA_INSPIRADORA: {
    name: 'Liderança Inspiradora',
    description:
      'Seu magnetismo pessoal deixa seus seguidores ávidos para ajudá-lo. Você gasta uma ação padrão (em vez de completa) para posicionar seus capangas em combate. Além disso, uma vez por rodada, pode gastar uma ação livre para fazê-los movimentar-se ou causar dano (mas continua só podendo fazê-los causar dano uma vez por rodada).',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 }],
    ],
  },
  MEDITACAO_AUTOAFIRMATIVA: {
    name: 'Meditação Autoafirmativa',
    description:
      'Você pode entrar em um transe hipnótico no qual convence a si mesmo de que possui certas habilidades. Para usar este poder, você deve escolher um benefício e meditar por 1 dia. No fim do dia, faça um teste de Carisma (CD conforme o benefício escolhido). Se passar, você adquire esse benefício por uma semana ou até usar este poder novamente. Enquanto medita, você fica fascinado. Você pode meditar por mais de um dia; nesse caso, cada dia fornece um bônus de +1 no teste de Carisma, até um máximo de +7 para uma semana.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  POSE_ASSUSTADORA: {
    name: 'Pose Assustadora',
    description:
      'Você recebe +2 em Intimidação e pode gastar 1 PM para assustar como uma ação de movimento.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 },
        { type: RequirementType.PERICIA, name: Skill.INTIMIDACAO },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Pose Assustadora' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  SEDUCAO_LASCIVA: {
    name: 'Sedução Lasciva',
    description:
      'Você pode seduzir pessoas com olhares, palavras, dança… Faça um teste de Enganação oposto pelo teste de Vontade de seu alvo. Se você vencer, o alvo fica enfeitiçado por 1 dia (se você falhar, não pode mais tentar com esse alvo nessa cena). Usar este poder gasta alguns minutos de interação e 3 PM.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 },
        { type: RequirementType.PERICIA, name: Skill.ENGANACAO },
      ],
    ],
  },
  VENTRILOQUISMO: {
    name: 'Ventriloquismo',
    description:
      'Você pode gastar 1 PM para fazer sua voz parecer vir de outro lugar (como de outra criatura, de uma estátua, de trás de uma porta, do fim de um corredor...) por 1 rodada. De acordo com o mestre, se um uso deste poder gerar uma situação muito suspeita, você precisará fazer um teste de Enganação oposto pela Intuição de quem está tentando enganar. Se a criatura vencê-lo, percebe que o som vem de você.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.ATUACAO },
        { type: RequirementType.PERICIA, name: Skill.ENGANACAO },
      ],
    ],
  },
};

export default destinyPowers;
