import { VariantClassOverrides } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import ARCANISTA from '../../classes/arcanista';

const magias = ARCANISTA.abilities.find((a) => a.name === 'Magias')!;

const NECROMANTE: VariantClassOverrides = {
  name: 'Necromante',
  isVariant: true,
  baseClassName: 'Arcanista',
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  abilities: [
    {
      name: 'Caminho do Necromante',
      text: 'Você lança magias por meio de uma conexão com a morte. Você pode aprender magias de necromancia divinas como se fossem arcanas, mas não pode aprender magias de encantamento e pelo menos metade das magias que aprender devem ser de necromancia. Além disso, para lançar suas magias você precisa primeiro acessar sua conexão com a morte. Para isso, você deve gastar uma quantidade de PV igual ao círculo máximo de magias que deseja usar (limitado pelo círculo máximo a que tem acesso). Uma vez ativada, a conexão se mantém até o fim da cena. Seu atributo-chave para magias é Inteligência.',
      nivel: 1,
    },
    {
      name: 'Falar com Mortos',
      text: 'Você pode se comunicar com mortos-vivos por meio de seus poderes arcanos. Você pode usar Misticismo com mortos-vivos para mudar atitude e persuasão. A partir do 3º nível, você pode gastar uma ação padrão e 1 PM para conversar com um cadáver em alcance curto. Esta habilidade funciona como a magia Voz Divina, com o aprimoramento de conceder um pouco de vida a um cadáver.',
      nivel: 1,
    },
    magias,
    {
      name: 'Animar Cadáver',
      text: 'No 2º nível, você pode gastar uma ação completa e 3 PM para animar o cadáver de uma criatura Pequena, Média ou Grande em alcance curto. O cadáver se torna um parceiro iniciante de um tipo a sua escolha, adequado ao seu tamanho e anatomia, que não conta em seu limite de parceiros (mas você só pode ter um parceiro cadáver por vez). Quando sofre dano, você pode sacrificar o parceiro cadáver para reduzir esse dano à metade. Cadáveres sacrificados não podem ser reanimados. A partir do 7º nível, quando você usa esta habilidade, pode gastar 6 PM para criar um parceiro veterano e, a partir do 11º nível, pode gastar 9 PM para criar um parceiro mestre.',
      nivel: 2,
    },
    {
      name: 'Necrologia',
      text: 'No 3º nível, você recebe +2 em Cura, Fortitude e na CD para resistir às suas magias de necromancia. A cada cinco níveis, esse bônus aumenta em +1.',
      nivel: 3,
    },
    {
      name: 'Distorção Necrótica',
      text: 'No 4º nível, escolha uma de suas magias conhecidas de 1º círculo que não seja de necromancia. A escola dessa magia muda para necromancia. Essa mudança não tem efeitos mecânicos (além da troca de escola), mas altera a aparência e natureza de seu efeito.',
      nivel: 4,
    },
    {
      name: 'Necropotência',
      text: 'No 5º nível, quando estabelece sua conexão com a morte, você pode gastar o dobro de PV. Se fizer isso, sempre que reduzir um ou mais inimigos vivos a 0 PV ou menos com uma magia de necromancia, você recebe 2 PM temporários. Você pode ganhar um máximo de PM temporários por cena igual ao seu nível. Esses pontos temporários desaparecem no fim da cena.',
      nivel: 5,
    },
    {
      name: 'Domínio Sobre a Morte',
      text: 'No 20° nível, você domina as fronteiras da vida e da morte. O custo em PM de suas magias de necromancia é reduzido à metade (após aplicar aprimoramentos e quaisquer outros efeitos que reduzam custo). Além disso, quando você mata uma criatura viva com uma magia de necromancia, pode gastar 2 PM para erguer seu cadáver como um morto-vivo sob seu controle. Isso funciona como a magia Servo Morto-Vivo, mas você escolhe o tipo de parceiro entre quaisquer aprimoramentos da magia e não precisa pagar seu componente material. Mortos-vivos erguidos dessa forma não contam em seu limite de parceiros durante a cena em que são criados (ao fim da cena, mortos-vivos excedentes, a sua escolha, voltam a ser apenas cadáveres).',
      nivel: 20,
    },
  ],
  spellPath: {
    initialSpells: 3,
    spellType: 'Arcane',
    excludeSchools: ['Encan'],
    includeDivineSchools: ['Necro'],
    qtySpellsLearnAtLevel: (level: number) => {
      if (level === 1) return 0;
      return 1;
    },
    spellCircleAvailableAtLevel: (level: number) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
    keyAttribute: Atributo.INTELIGENCIA,
  },
  powers: [
    {
      name: 'Ritual do Lich',
      text: 'Você aprendeu o Ritual do Lich e pode executar seus passos.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Celebrar Ritual' },
          { type: RequirementType.PODER, name: 'Escrever Pergaminho' },
          { type: RequirementType.PODER, name: 'Preparar Poção' },
          { type: RequirementType.NIVEL, value: 17 },
        ],
      ],
    },
  ],
  setup: undefined,
  attrPriority: [Atributo.INTELIGENCIA],
};

export default NECROMANTE;
