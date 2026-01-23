import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Caçador do suplemento Heróis de Arton
 */
const CACADOR_POWERS: ClassPower[] = [
  {
    name: 'Armadilha Alquímica',
    text: 'Quando prepara uma armadilha, você pode gastar uma dose de um preparado alquímico. Se fizer isso, as criaturas afetadas pela armadilha também sofrem os efeitos desse preparado automaticamente.',
    requirements: [[{ type: RequirementType.PODER, name: 'Armadilheiro' }]],
  },
  {
    name: 'Avanço do Predador',
    text: 'Uma vez por rodada, quando uma criatura marcada por sua Marca da Presa se afasta voluntariamente de você, você pode gastar 1 PM para se mover na direção dela (até o limite do seu deslocamento).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Ímpeto' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Batedor Marcial',
    text: 'Você pode usar testes de Sobrevivência no lugar de testes de Guerra. Além disso, se passar em um teste para analisar terreno, além de quaisquer benefícios encontrados, na próxima vez que usar Marca da Presa nessa cena você recupera 1 PM.',
    requirements: [],
  },
  {
    name: 'Curandeiro dos Ermos',
    text: 'Você pode usar Ervas Curativas como uma ação de movimento e os dados de cura dessa habilidade aumentam para d8.',
    requirements: [[{ type: RequirementType.PODER, name: 'Ervas Curativas' }]],
  },
  {
    name: 'Elo Com a Natureza Maior',
    text: 'Escolha duas magias entre Abençoar Alimentos, Acalmar Animal, Alarme, Aviso, Conjurar Armadilhas, Detectar Ameaças, Orientação ou Suporte Ambiental. Você aprende e pode lançar as magias escolhidas (atributo-chave Sabedoria) e pode usar seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um druida do seu nível. Você pode escolher este poder mais vezes para magias diferentes.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Elo com a Natureza' }],
    ],
  },
  {
    name: 'Explorador Viajado',
    text: 'Você pode escolher dois tipos de terrenos extras para sua habilidade Explorador. Você pode escolher este poder mais vezes para tipos de terrenos adicionais.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Flecheiro',
    text: 'Você pode usar Sobrevivência no lugar de Ofício para fabricar munições e pode fabricar munições com uma melhoria.',
    requirements: [[{ type: RequirementType.NIVEL, value: 3 }]],
  },
  {
    name: 'Golpe do Predador',
    text: 'Se você causar dano em uma criatura analisada por sua Marca da Presa, ela fica sangrando. Se ela já estiver sangrando, a perda de vida por sangramento aumenta em um passo (cumulativo até um máximo de d12) e ela falha automaticamente em seu próximo teste de Constituição para remover essa condição.',
    requirements: [],
  },
  {
    name: 'Herói do Povo',
    text: 'Você recebe +2 na Defesa e em testes de resistência. Além disso, sempre que acertar um ataque em um vilão que esteja ameaçando pessoas comuns (um bandido assolando camponeses, um nobre tirano, um monstro devorando viajantes...), você recebe 2 PM temporários. Você pode receber um número máximo de PM temporários por cena igual ao seu nível e eles desaparecem no fim da cena.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herói do Povo' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herói do Povo' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herói do Povo' },
        target: { type: 'Skill', name: Skill.REFLEXOS },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herói do Povo' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Identificar Presas',
    text: 'Você pode identificar criaturas como uma ação de movimento. Além disso, se passar nesse teste, para cada informação obtida você recebe +1 em rolagens de dano contra criaturas dessa espécie até o fim da cena.',
    requirements: [],
  },
  {
    name: 'Lâminas Guardiãs',
    text: 'Enquanto você estiver empunhando duas armas corpo a corpo, recebe +2 na Defesa e em testes de resistência contra inimigos em seu alcance natural.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Ambidestria' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Lanceiro',
    text: 'Você recebe +2 em testes de ataque e rolagens de dano com lanças (exceto lanças montadas e de justa). Além disso, se estiver empunhando uma dessas armas com as duas mãos, seu dano com ela aumenta em um passo e ela é considerada uma arma alongada.',
    requirements: [],
  },
  {
    name: 'Pega!',
    text: 'Você pode gastar uma ação de movimento e 1 PM para fazer a manobra agarrar contra uma criatura em alcance curto usando Adestramento em vez de Luta, usando seu companheiro animal para isso. Se o alvo estiver sob efeito de sua Marca da Presa, você soma os dados dessa habilidade como um bônus no teste. A criatura permanece agarrada até vencer um teste de manobra contra seu companheiro animal (como acima) ou até você mandar seu animal soltá-la (uma ação livre).',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Companheiro Animal' }],
    ],
  },
  {
    name: 'Primeiro Sangue',
    text: 'Na primeira rodada de cada combate, você recebe +2 em testes de ataque e todos os seus dados de dano aumentam em dois passos.',
    requirements: [[{ type: RequirementType.PODER, name: 'Emboscar' }]],
  },
  {
    name: 'Sequência Dilaceradora',
    text: 'Quando usa Ambidestria, se acertar ambos os ataques, você pode gastar 1 PM para causar +2d8 pontos de dano no segundo ataque.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Ambidestria' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Sequência do Predador',
    text: 'Quando usa Ambidestria com armas que causam tipos de dano diferentes, se acertar ambos os ataques, você pode gastar 1 PM para fazer uma manobra entre desarmar, derrubar ou quebrar contra o mesmo alvo.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Ambidestria' },
        { type: RequirementType.NIVEL, value: 8 },
      ],
    ],
  },
  {
    name: 'Sombra dos Ermos',
    text: 'Você pode gastar uma ação de movimento e 1 PM para receber camuflagem leve com duração sustentada.',
    requirements: [[{ type: RequirementType.PODER, name: 'Camuflagem' }]],
  },
  {
    name: 'Tiro de Abate',
    text: 'Quando usa a ação mirar, até o fim do turno você recebe +2 em testes de ataque e na margem de ameaça com ataques à distância, e os dados extras de sua habilidade Marca da Presa também são multiplicados em caso de acerto crítico.',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.SABEDORIA, value: 1 },
        { type: RequirementType.PODER, name: 'Espreitar' },
      ],
    ],
  },
  {
    name: 'Tiro Trespassante',
    text: 'Quando você faz um ataque à distância com uma arma de disparo e reduz os pontos de vida do alvo a 0 ou menos, pode gastar 1 PM para fazer um ataque adicional contra outra criatura que esteja adiante na mesma linha, usando a mesma arma e munição do ataque original.',
    requirements: [[{ type: RequirementType.PODER, name: 'Arqueiro' }]],
  },
  {
    name: 'Tempestade de Lâminas',
    text: 'Quando usa Chuva de Lâminas, você pode fazer um ataque adicional com sua arma secundária (para um total de quatro ataques na ação).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Chuva de Lâminas' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Tocaia Habilidosa',
    text: 'Sua Marca da Presa também fornece +1 na CD de suas habilidades contra a criatura marcada para cada PM gasto. Esse bônus dobra com a habilidade Inimigo.',
    requirements: [],
  },
  {
    name: 'Último Sangue',
    text: 'Seus ataques contra criaturas sangrando causam um dado extra de dano do mesmo tipo.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
];

export default CACADOR_POWERS;
