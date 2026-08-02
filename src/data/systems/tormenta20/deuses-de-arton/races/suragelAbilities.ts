import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Race, { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import EQUIPAMENTOS from '../../equipamentos';
import PROFICIENCIAS from '../../proficiencias';

/**
 * Armas exóticas do livro básico — pool da opção "duas armas exóticas" da
 * Herança de Werra. `availableProficiencies` é uma lista estática de strings
 * (sem consciência de suplemento), então exóticas de Heróis/Ameaças de Arton
 * ficam de fora; elas podem ser adicionadas à mão no editor de proficiências.
 */
const EXOTIC_WEAPON_NAMES = EQUIPAMENTOS.armasExoticas.map(
  (weapon) => weapon.nome
);

/**
 * Chaves em `sheet.optionChoices` com a forma selvagem escolhida por Arbória e
 * Chacina. O motor de Forma Selvagem vive no módulo premium e lê estas chaves
 * (casando pelo NOME da forma) para liberar só a forma escolhida — este arquivo
 * não importa nada de premium, senão a build open-source (que troca o módulo por
 * um stub vazio) passaria a depender dele.
 */
export const SURAGEL_WILD_SHAPE_OPTION_KEYS = {
  arboria: 'suragelArboriaForma',
  chacina: 'suragelChacinaForma',
} as const;

/**
 * Habilidades raciais alternativas para Suraggel (Aggelus e Sulfure)
 * do suplemento Deuses de Arton.
 *
 * Estas habilidades podem substituir Luz Sagrada (Aggelus) ou Sombras Profanas (Sulfure).
 */

export interface SuragelAlternativeAbility extends RaceAbility {
  plano: string; // Plano de origem da habilidade
}

export const SURAGEL_ALTERNATIVE_ABILITIES: SuragelAlternativeAbility[] = [
  // === TOTALMENTE AUTOMATIZADAS (bônus fixos) ===
  {
    name: 'Herança de Drashantyr',
    plano: 'Drashantyr',
    description:
      'Graças ao poder elemental dos dragões, você recebe +1 PM e redução de ácido, eletricidade, fogo, frio, luz e trevas 5.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'PM' },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Ácido' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Eletricidade' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Fogo' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Frio' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Luz' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Herança de Drashantyr' },
        target: { type: 'DamageReduction', damageType: 'Trevas' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  {
    name: 'Herança de Kundali',
    plano: 'Kundali',
    description:
      'Pelo espírito protetor, mas também opressor, de Tauron, você recebe +2 na Defesa e em testes de manobras de combate.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Kundali' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    // Nota: +2 em manobras de combate é apenas descritivo
  },
  {
    name: 'Herança de Odisseia',
    plano: 'Odisseia',
    description:
      'Sua alma tocada por Valkaria está sempre preparada para problemas! Você recebe +2 em Iniciativa e Percepção, e sua capacidade de carga aumenta em 2 espaços.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Odisseia' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herança de Odisseia' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herança de Odisseia' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Herança de Ordine',
    plano: 'Ordine',
    description:
      'As forças da lei e ordem de Khalmyr afetam suas ações. Você recebe +2 em Intuição, em Investigação e em testes sem rolagens de dados (ao escolher 0, 10 ou 20).',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Ordine' },
        target: { type: 'Skill', name: Skill.INTUICAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herança de Ordine' },
        target: { type: 'Skill', name: Skill.INVESTIGACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    // Nota: Bônus em testes sem dados é apenas descritivo
  },
  {
    name: 'Herança de Terápolis',
    plano: 'Terápolis',
    description:
      'Você recebe +2 em Intuição e Vontade, e pode fazer testes dessas perícias contra ilusões automaticamente, sem precisar interagir com elas.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Terápolis' },
        target: { type: 'Skill', name: Skill.INTUICAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herança de Terápolis' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Herança de Venomia',
    plano: 'Venomia',
    description:
      'Ser escorregadio como Sszzaas faz parte de sua natureza, mesmo que você não goste disso. Você recebe +2 em Enganação e em testes para evitar manobras de combate e efeitos de movimento.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Venomia' },
        target: { type: 'Skill', name: Skill.ENGANACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    // Nota: +2 para evitar manobras é apenas descritivo
  },
  {
    name: 'Herança de Vitalia',
    plano: 'Vitalia',
    description:
      'A força da vida corre intensa em seu sangue. Você recebe +5 PV por patamar e sua recuperação de pontos de vida com descanso aumenta em uma categoria.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Vitalia' },
        target: { type: 'PV' },
        modifier: {
          type: 'LevelCalc',
          formula: 'Math.floor(({level} - 1) / 5 + 1) * 5',
        },
      },
    ],
    // Nota: Recuperação aumentada é apenas descritiva
  },

  // === COM SELEÇÃO NA CRIAÇÃO ===
  {
    name: 'Herança de Al-Gazara',
    plano: 'Al-Gazara',
    description:
      'Devido à presença do puro caos primordial de Nimb em seu sangue, você recebe +1 em um atributo aleatório.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Al-Gazara' },
        action: {
          type: 'increaseAttribute',
        },
      },
    ],
  },
  {
    name: 'Herança de Arbória',
    plano: 'Arbória',
    description:
      'Como parte do Grande Ciclo de Allihanna, você recebe a habilidade Forma Selvagem para uma única forma, escolhida entre Ágil, Sorrateira e Veloz. Caso adquira essa habilidade novamente, o custo dessa forma diminui em –1 PM.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Arbória' },
        action: {
          type: 'chooseFromOptions',
          optionKey: SURAGEL_WILD_SHAPE_OPTION_KEYS.arboria,
          pick: 1,
          options: [
            {
              name: 'Forma Ágil',
              text: 'Você assume a forma de um felino: +2 Destreza e duas garras (1d6, crítico 19, corte).',
            },
            {
              name: 'Forma Sorrateira',
              text: 'Você assume a forma de um morcego: +2 Destreza, tamanho Pequeno e uma garra (1d4).',
            },
            {
              name: 'Forma Veloz',
              text: 'Você assume a forma de um cervo: +2 Destreza, deslocamento aumentado e uma chifrada (1d6).',
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Herança de Chacina',
    plano: 'Chacina',
    description:
      'Pela ferocidade de Megalokk, você recebe a habilidade Forma Selvagem para uma única forma, escolhida entre Feroz e Resistente. Caso adquira essa habilidade novamente, o custo dessa forma diminui em –1 PM.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Chacina' },
        action: {
          type: 'chooseFromOptions',
          optionKey: SURAGEL_WILD_SHAPE_OPTION_KEYS.chacina,
          pick: 1,
          options: [
            {
              name: 'Forma Feroz',
              text: 'Você assume a forma de um urso: +3 Força, +2 na Defesa e uma mordida (1d8).',
            },
            {
              name: 'Forma Resistente',
              text: 'Você assume a forma de uma tartaruga: +5 na Defesa, redução de dano 5 e uma investida (1d6).',
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Herança de Magika',
    plano: 'Magika',
    description:
      'Você aprende e pode lançar uma magia arcana de 1º círculo a sua escolha (atributo-chave Inteligência ou Carisma, a sua escolha). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Magika' },
        action: {
          type: 'learnAnySpellFromHighestCircle',
          pick: 1,
          allowedType: 'Arcane',
        },
      },
    ],
  },
  {
    name: 'Herança de Nivenciuén',
    plano: 'Nivenciuén',
    description:
      'Mesmo que o Reino de Glórienn tenha sofrido um destino terrível, a antiga soberania élfica ainda permeia seu sangue. Você recebe +2 em Misticismo e uma habilidade racial dos elfos entre Graça de Glórienn e Sangue Mágico.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Nivenciuén' },
        target: { type: 'Skill', name: Skill.MISTICISMO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Nivenciuén' },
        action: {
          type: 'chooseFromOptions',
          optionKey: 'suragelNivenciuenElfica',
          pick: 1,
          options: [
            {
              name: 'Graça de Glórienn',
              text: 'Seu deslocamento é 12m (em vez de 9m).',
              sheetBonuses: [
                {
                  source: { type: 'power', name: 'Herança de Nivenciuén' },
                  // O elfo chega aos 12m por `getDisplacement`, não por bônus da
                  // habilidade — aqui o Suraggel parte dos 9m padrão e sobe +3.
                  target: { type: 'Displacement' },
                  modifier: { type: 'Fixed', value: 3 },
                },
              ],
            },
            {
              name: 'Sangue Mágico',
              text: 'Você recebe +1 ponto de mana por nível.',
              sheetBonuses: [
                {
                  source: { type: 'power', name: 'Herança de Nivenciuén' },
                  target: { type: 'PM' },
                  modifier: { type: 'LevelCalc', formula: '{level}' },
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Herança de Pelágia',
    plano: 'Pelágia',
    description:
      'Mesmo nas situações mais desesperadoras, seu espírito se mantém plácido e imperturbável como o próprio Oceano. Escolha três perícias. Com elas, você pode gastar 1 PM para escolher 10 em qualquer situação, exceto testes de ataque.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Pelágia' },
        action: {
          type: 'learnSkill',
          availableSkills: [
            Skill.ACROBACIA,
            Skill.ADESTRAMENTO,
            Skill.ATLETISMO,
            Skill.ATUACAO,
            Skill.CAVALGAR,
            Skill.CONHECIMENTO,
            Skill.CURA,
            Skill.DIPLOMACIA,
            Skill.ENGANACAO,
            Skill.FORTITUDE,
            Skill.FURTIVIDADE,
            Skill.GUERRA,
            Skill.INICIATIVA,
            Skill.INTIMIDACAO,
            Skill.INTUICAO,
            Skill.INVESTIGACAO,
            Skill.JOGATINA,
            Skill.LADINAGEM,
            Skill.MISTICISMO,
            Skill.NOBREZA,
            Skill.OFICIO,
            Skill.PERCEPCAO,
            Skill.PILOTAGEM,
            Skill.REFLEXOS,
            Skill.RELIGIAO,
            Skill.SOBREVIVENCIA,
            Skill.VONTADE,
          ],
          pick: 3,
        },
      },
    ],
    // Nota: A mecânica de "escolher 10" é apenas descritiva
  },
  {
    name: 'Herança de Ramknal',
    plano: 'Ramknal',
    description:
      'Escolha duas perícias entre Acrobacia, Enganação, Furtividade, Jogatina e Ladinagem. Quando faz um teste da perícia escolhida, você pode gastar 2 PM para receber +5 nesse teste.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Ramknal' },
        action: {
          type: 'learnSkill',
          availableSkills: [
            Skill.ACROBACIA,
            Skill.ENGANACAO,
            Skill.FURTIVIDADE,
            Skill.JOGATINA,
            Skill.LADINAGEM,
          ],
          pick: 2,
        },
      },
    ],
    // Nota: A mecânica de "gastar PM para +5" é apenas descritiva
  },
  {
    name: 'Herança de Werra',
    plano: 'Werra',
    description:
      'Você possui um conhecimento intuitivo para armas. Você recebe +1 em testes de ataque com armas e proficiência com armas marciais ou com duas armas exóticas.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Herança de Werra' },
        action: {
          type: 'chooseFromOptions',
          optionKey: 'suragelWerraProficiencia',
          pick: 1,
          options: [
            {
              name: 'Armas Marciais',
              text: 'Você recebe proficiência com armas marciais.',
              sheetBonuses: [
                {
                  source: { type: 'power', name: 'Herança de Werra' },
                  target: {
                    type: 'Proficiency',
                    proficiency: PROFICIENCIAS.MARCIAIS,
                  },
                  modifier: { type: 'Fixed', value: 1 },
                },
              ],
            },
            {
              name: 'Duas Armas Exóticas',
              text: 'Você recebe proficiência com duas armas exóticas a sua escolha.',
              // Proficiência por arma nomeada: `isProficientWithWeapon` casa pelo
              // nome antes de olhar a categoria, então não é preciso conceder a
              // categoria "Armas Exóticas" inteira.
              sheetActions: [
                {
                  source: { type: 'power', name: 'Herança de Werra' },
                  action: {
                    type: 'addProficiency',
                    availableProficiencies: EXOTIC_WEAPON_NAMES,
                    pick: 2,
                  },
                },
              ],
            },
          ],
        },
      },
    ],
    // Nota: +1 em ataque é apenas descritivo
  },

  // === APENAS DESCRITIVAS (dependem de ação em jogo) ===
  {
    name: 'Herança de Deathok',
    plano: 'Deathok',
    description:
      'A mudança constante faz parte de sua alma. Você recebe +2 em duas perícias a sua escolha. A cada manhã, você pode trocar essas perícias.',
    // Totalmente descritiva - troca de perícias diária é escolha do jogador em jogo
  },
  {
    name: 'Herança de Pyra',
    plano: 'Pyra',
    description:
      'Em algum lugar dentro de você, sempre existe uma segunda chance. Quando faz um teste de resistência ou um teste de atributo para remover uma condição, você pode gastar 2 PM para rolá-lo novamente.',
    // Totalmente descritiva - decisão em jogo
  },
  {
    name: 'Herança de Serena',
    plano: 'Serena',
    description:
      'Pela proteção de Marah, você recebe +2 na Defesa e em testes de resistência contra oponentes aos quais não tenha causado dano, perda de PV ou condições (exceto enfeitiçado, fascinado e pasmo) nessa cena.',
    // Totalmente descritiva - bônus condicional
  },
  {
    name: 'Herança de Skerry',
    plano: 'Skerry',
    description:
      'Você carrega a força de criatividade. Quando faz um teste de Ofício, pode gastar 1 PM para ser treinado na perícia em questão ou para rolar dois dados e usar o melhor resultado.',
    // Totalmente descritiva - decisão em jogo
  },
  {
    name: 'Herança de Solaris',
    plano: 'Solaris',
    description:
      'Pelo poder de Azgher, durante o dia você recebe +1 em todos os testes de perícia. Se estiver diretamente sob a luz do sol, esse bônus aumenta para +2.',
    // Totalmente descritiva - depende de condição em jogo (hora do dia)
  },
  {
    name: 'Herança de Sombria',
    plano: 'Sombria',
    description:
      'Pelo poder de Tenebra, durante a noite você recebe +1 em todos os testes de perícia. Se estiver num local sem nenhuma iluminação artificial (como tochas ou magia), esse bônus aumenta para +2.',
    // Totalmente descritiva - depende de condição em jogo (hora do dia/iluminação)
  },
  {
    name: 'Herança de Sora',
    plano: 'Sora',
    description:
      'Os honrados espíritos ancestrais de Lin-Wu abençoam sua perseverança. Você recebe +2 em Nobreza, Vontade e em testes de perícia estendidos (incluindo contra perigos complexos).',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Herança de Sora' },
        target: { type: 'Skill', name: Skill.NOBREZA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Herança de Sora' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    // Nota: Bônus em testes estendidos é apenas descritivo
  },
];

/** Nome da habilidade racial padrão que a herança alternativa substitui. */
export function getSuragelDefaultAbilityName(raceName: string): string {
  return raceName.includes('Aggelus') ? 'Luz Sagrada' : 'Sombras Profanas';
}

/** Herança alternativa pelo nome (undefined se não existir). */
export function getSuragelAlternativeAbility(
  abilityName?: string
): SuragelAlternativeAbility | undefined {
  if (!abilityName) return undefined;
  return SURAGEL_ALTERNATIVE_ABILITIES.find((a) => a.name === abilityName);
}

/**
 * Escolha embutida da herança (Nivenciuén, Arbória, Chacina), quando houver.
 *
 * O assistente de criação já pede essas escolhas pelo passo "Efeitos de Poderes";
 * o editor da ficha usa isto para oferecer a mesma escolha em vez de deixar o
 * sorteio do `applyPower` decidir sem volta.
 */
export function getSuragelAbilityChoiceAction(abilityName?: string):
  | {
      optionKey: string;
      options: Array<{ name: string; text: string }>;
    }
  | undefined {
  const ability = getSuragelAlternativeAbility(abilityName);
  if (!ability?.sheetActions) return undefined;

  const choice = ability.sheetActions.find(
    (sheetAction) => sheetAction.action.type === 'chooseFromOptions'
  );
  if (choice?.action.type !== 'chooseFromOptions') return undefined;

  return {
    optionKey: choice.action.optionKey,
    options: choice.action.options.map((option) => ({
      name: option.name,
      text: option.text,
    })),
  };
}

/**
 * Substitui a habilidade racial padrão do Suraggel (Luz Sagrada / Sombras
 * Profanas) pela herança alternativa escolhida.
 *
 * PONTO ÚNICO da troca: assistente de criação (`race` memo), `generateEmptySheet`
 * e o editor da ficha usam esta função. O assistente precisa dela porque o passo
 * "Efeitos de Poderes" deriva as escolhas pendentes de `race.abilities` — sem a
 * troca ali, ele pedia as seleções da habilidade padrão e nunca as da herança.
 *
 * Copia a habilidade INTEIRA (menos `plano`), não só bônus/ações, para não
 * perder `rolls`, `customEffects` e `grantsPowerRequirements`.
 */
export function applySuragelAlternativeAbility(
  race: Race,
  abilityName?: string
): Race {
  if (!race.name.startsWith('Suraggel')) return race;

  const alternative = getSuragelAlternativeAbility(abilityName);
  if (!alternative) return race;

  const defaultAbilityName = getSuragelDefaultAbilityName(race.name);
  const abilityIndex = race.abilities.findIndex(
    (a) => a.name === defaultAbilityName
  );
  if (abilityIndex === -1) return race;

  // Clone: a habilidade vai parar dentro de `sheet.raca.abilities`, e o catálogo
  // aqui é um singleton compartilhado por todas as fichas.
  const ability: RaceAbility = omit(cloneDeep(alternative), 'plano');

  return {
    ...race,
    abilities: [
      ...race.abilities.slice(0, abilityIndex),
      ability,
      ...race.abilities.slice(abilityIndex + 1),
    ],
  };
}

export default SURAGEL_ALTERNATIVE_ABILITIES;
