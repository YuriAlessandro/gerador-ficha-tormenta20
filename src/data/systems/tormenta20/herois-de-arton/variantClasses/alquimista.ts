import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import INVENTOR from '../../classes/inventor';
import PROFICIENCIAS from '../../proficiencias';

const engenhosidade = INVENTOR.abilities.find(
  (a) => a.name === 'Engenhosidade'
)!;

const ALQUIMISTA: VariantClassOverrides = {
  name: 'Alquimista',
  isVariant: true,
  baseClassName: 'Inventor',
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.OFICIO_ALQUIMIA, Skill.VONTADE],
    },
  ],
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    engenhosidade,
    {
      name: 'Laboratório Pessoal',
      text: 'Você começa o jogo com instrumentos de alquimista aprimorados e 10 itens alquímicos com preço total de até T$ 300.',
      nivel: 1,
      sheetActions: [
        {
          source: { type: 'class', className: 'Alquimista' },
          action: {
            type: 'addAlchemyItems',
            budget: 300,
            count: 10,
          },
        },
      ],
    },
    {
      name: 'Alquimista Iniciado',
      text: 'No 2º nível, você recebe o poder Alquimista Iniciado.',
      nivel: 2,
      sheetActions: [
        {
          source: { type: 'class', className: 'Alquimista' },
          action: {
            type: 'grantSpecificClassPower',
            powerName: 'Alquimista Iniciado',
          },
        },
      ],
    },
    {
      name: 'Mistura Básica',
      text: 'A partir do 3º nível, você pode usar catalisadores em itens alquímicos como se fossem magias.',
      nivel: 3,
    },
    {
      name: 'Aplicação Rápida',
      text: 'No 5º nível, você pode gastar uma ação completa e 2 PM para usar dois preparados alquímicos ao mesmo tempo. Você precisa ter ambos em suas mãos ou ser capaz de sacá-los como ação livre.',
      nivel: 5,
    },
    {
      name: 'Magia Engarrafada',
      text: 'No 7º nível, você pode usar Mistura Básica e Aplicação Rápida em poções.',
      nivel: 7,
    },
    {
      name: 'Odores Alquímicos',
      text: 'A partir do 8º nível, você pode gastar uma ação completa para detectar a presença de itens alquímicos e poções em alcance médio. No caso de itens alquímicos, você descobre seu tipo (preparado, veneno etc.) e uso geral (curar, fornecer bônus etc.). Para poções, você identifica qual magia ela emula e com quantos pontos de mana foi fabricada.',
      nivel: 8,
    },
    {
      name: 'Fabricar Emulsão',
      text: 'No 9º nível, você aprende a fabricar emulsões com um encanto (veja o quadro). Nos níveis 13 e 17, você aprende a fabricar emulsões com respectivamente dois e três encantos.',
      nivel: 9,
    },
    {
      name: 'Mestre Alquimista',
      text: 'No 10º nível, você recebe o poder Mestre Alquimista.',
      nivel: 10,
      sheetActions: [
        {
          source: { type: 'class', className: 'Alquimista' },
          action: {
            type: 'grantSpecificClassPower',
            powerName: 'Mestre Alquimista',
          },
        },
      ],
    },
    {
      name: 'Bombardeio Eficiente',
      text: 'A partir do 11º nível, quando usa um preparado alquímico ou uma poção que causa dano, você pode gastar 1 PM para que esse item ignore 10 pontos da redução de dano das criaturas atingidas.',
      nivel: 11,
    },
    {
      name: 'Pedra Filosofal',
      text: 'No 20º nível, você recebe uma pedra filosofal, um material que combina alquimia, magia e sua própria energia vital em uma fórmula única. Enquanto estiver de posse de sua pedra filosofal, você tem Cura Acelerada 10 e, quando faz um teste de Fortitude, rola dois dados e usa o melhor resultado. Além disso, se você ou um aliado em alcance curto for reduzido a 0 PV ou morrer, você pode sacrificar sua pedra filosofal para salvar essa criatura. A pedra se estilhaça em uma explosão de energia positiva que fornece ao alvo o efeito básico da magia Segunda Chance (com o efeito adicional de reconstruir o corpo do alvo, caso tenha sido destruído ou desintegrado). Você só pode ter uma pedra filosofal por vez; se perdê-la, pode fabricar outra com uma semana de trabalho e o gasto de T$ 18.000.',
      nivel: 20,
    },
  ],
};

export default ALQUIMISTA;
