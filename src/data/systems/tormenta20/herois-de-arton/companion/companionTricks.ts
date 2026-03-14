import {
  CompanionType,
  CompanionSize,
  CompanionTrick,
} from '../../../../../interfaces/Companion';

export interface CompanionTrickRequirements {
  minTrainerLevel?: number;
  allowedTypes?: CompanionType[];
  requiredTricks?: string[];
  requiredSize?: CompanionSize;
  minNaturalWeapons?: number;
  creationOnly?: boolean;
  canRepeat?: boolean;
}

export interface CompanionTrickDefinition {
  name: string;
  text: string;
  requirements?: CompanionTrickRequirements;
  hasSubChoice?: boolean;
  subChoiceType?: 'attribute' | 'spell' | 'maneuver' | 'element' | 'movement';
}

const COMPANION_TRICKS: CompanionTrickDefinition[] = [
  {
    name: 'Alado',
    text: 'Seu melhor amigo ganha deslocamento de voo 15m.',
    requirements: {
      requiredTricks: ['Asas'],
      minTrainerLevel: 5,
    },
  },
  {
    name: 'Amigão',
    text: 'Seu melhor amigo recebe +1 em Força e o tamanho dele muda para Enorme. Isso aumenta o dano de suas armas naturais em um passo e afeta seu modificador de Furtividade e manobras.',
    requirements: {
      requiredSize: 'Grande',
      minTrainerLevel: 7,
    },
  },
  {
    name: 'Amigo Feroz',
    text: 'Seu melhor amigo recebe +2 em testes de ataque e na margem de ameaça com suas armas naturais, e o dano delas aumenta em um passo.',
  },
  {
    name: 'Amigo Protetor',
    text: 'Quando você sofre dano, caso seu melhor amigo esteja em alcance curto, você pode gastar 2 PM para que ele salte em sua defesa. Se fizer isso, você sofre apenas metade do dano e o melhor amigo sofre o restante.',
  },
  {
    name: 'Amigo Veterano',
    text: 'Seu amigo vira um parceiro veterano de seu tipo.',
    requirements: {
      minTrainerLevel: 5,
    },
  },
  {
    name: 'Amigo Mestre',
    text: 'Seu amigo veterano vira um parceiro mestre de seu tipo.',
    requirements: {
      requiredTricks: ['Amigo Veterano'],
      minTrainerLevel: 11,
    },
  },
  {
    name: 'Anatomia Humanoide',
    text: 'Seu melhor amigo tem uma forma humanoide e Int –2 (em vez de –4). Ele não recebe uma arma natural inicial, mas tem proficiência com armas simples e armaduras leves, pode empunhar dois itens e vestir um item adicional, e tem um limite de carga de 10 espaços. Este truque só pode ser escolhido na criação do melhor amigo.',
    requirements: {
      allowedTypes: ['Construto', 'Morto-Vivo'],
      creationOnly: true,
    },
  },
  {
    name: 'Arma Natural Adicional',
    text: 'Seu melhor amigo recebe uma arma natural adicional. Quando ele faz a ação agredir com outra arma, você pode gastar 1 PM para que ele faça um ataque corpo a corpo extra com essa arma.',
    requirements: {
      allowedTypes: ['Animal', 'Monstro'],
    },
  },
  {
    name: 'Asas',
    text: 'Seu melhor amigo possui asas que podem ser usadas para pairar a 1,5m do chão com deslocamento 12m. Isso permite que ele ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para que ele voe com deslocamento 12m.',
  },
  {
    name: 'Bote',
    text: 'Quando faz uma investida, seu melhor amigo pode atacar com todas as suas armas naturais. Todos os ataques recebem o bônus de +2 da investida, mas devem ser feitos contra o mesmo alvo.',
    requirements: {
      minNaturalWeapons: 2,
    },
  },
  {
    name: 'Condicionamento Especial',
    text: 'O melhor amigo recebe +2 em um atributo e +1 em outro atributo, exceto Inteligência. Você pode escolher este truque uma vez por patamar.',
    hasSubChoice: true,
    subChoiceType: 'attribute',
    requirements: {
      canRepeat: true,
    },
  },
  {
    name: 'Deslocamento Especial',
    text: 'Seu melhor amigo recebe deslocamento de escalada ou de natação igual a seu deslocamento base. Você pode escolher este truque uma segunda vez para que ele tenha ambos os deslocamentos.',
    hasSubChoice: true,
    subChoiceType: 'movement',
    requirements: {
      canRepeat: true,
    },
  },
  {
    name: 'Magia Inata',
    text: 'Escolha uma magia de 1º círculo, arcana ou divina. Seu melhor amigo aprende e pode lançar essa magia (atributo-chave Carisma do treinador). Você pode escolher este truque outras vezes para magias diferentes.',
    hasSubChoice: true,
    subChoiceType: 'spell',
    requirements: {
      allowedTypes: ['Espírito'],
      canRepeat: true,
    },
  },
  {
    name: 'Manobra Ensaiada',
    text: 'Escolha uma manobra de combate. Seu melhor amigo recebe +2 em testes de ataque para executar essa manobra e, uma vez por rodada, quando ele acerta um ataque com uma arma natural, você pode gastar 1 PM para que ele faça essa manobra contra o alvo do ataque como uma ação livre.',
    hasSubChoice: true,
    subChoiceType: 'maneuver',
  },
  {
    name: 'Reanimação Sombria',
    text: 'Uma vez por cena, se seu melhor amigo estiver com 0 PV ou menos, você pode gastar 3 PM por patamar para reanimá-lo. Se você fizer isso, ele é reerguido com pontos de vida iguais à metade do seu máximo.',
    requirements: {
      allowedTypes: ['Morto-Vivo'],
    },
  },
  {
    name: 'Redução de Dano',
    text: 'Seu melhor amigo recebe redução de dano 5.',
    requirements: {
      minTrainerLevel: 5,
    },
  },
  {
    name: 'Sopro',
    text: 'Seu melhor amigo recebe um sopro de um tipo a sua escolha entre ácido, fogo, frio ou eletricidade. Você pode gastar uma ação padrão e uma quantidade de PM limitada pelo seu Carisma para que seu melhor amigo sopre um cone de 6m de energia do tipo escolhido. Para cada PM gasto, criaturas na área sofrem 2d8 pontos de dano do tipo escolhido (Reflexos CD Car do treinador reduz à metade).',
    hasSubChoice: true,
    subChoiceType: 'element',
    requirements: {
      allowedTypes: ['Construto', 'Espírito', 'Monstro'],
    },
  },
  {
    name: 'Táticas de Matilha',
    text: 'Se seu melhor amigo estiver flanqueando um inimigo, além do bônus normal por flanquear, recebe +2 nos testes de ataque (total +4) e nas rolagens de dano contra ele. Se você estiver flanqueando com ele, recebe os mesmos bônus.',
  },
  {
    name: 'Treinamento de Companhia',
    text: 'Seu melhor amigo recebe uma ação de movimento adicional nos turnos dele (apenas para se deslocar).',
    requirements: {
      allowedTypes: ['Animal'],
    },
  },
  {
    name: 'Treinamento Defensivo',
    text: 'Seu melhor amigo passa a receber um bônus na Defesa igual ao seu nível (em vez de metade do nível).',
  },
  {
    name: 'Treinamento Marcial',
    text: 'Seu melhor amigo recebe +2 em testes de ataque e rolagens de dano. Para cada patamar acima de iniciante, esse bônus aumenta em +1. Se ele possuir o truque Anatomia Humanoide, também recebe proficiência com armas marciais, armaduras pesadas e escudos.',
  },
  {
    name: 'Veloz',
    text: 'Seu melhor amigo recebe +2 na Defesa e +3m em seus deslocamentos e se torna treinado em Atletismo (se já for, recebe +2 nessa perícia).',
  },
];

export default COMPANION_TRICKS;

export function getCompanionTrickDefinition(
  name: string
): CompanionTrickDefinition | undefined {
  return COMPANION_TRICKS.find((t) => t.name === name);
}

export function isTrickAvailable(
  trick: CompanionTrickDefinition,
  trainerLevel: number,
  companionType: CompanionType,
  companionSize: CompanionSize,
  existingTricks: CompanionTrick[],
  naturalWeaponCount: number,
  isCreation: boolean
): boolean {
  const reqs = trick.requirements;
  if (!reqs) return true;

  if (reqs.creationOnly && !isCreation) return false;
  if (reqs.minTrainerLevel && trainerLevel < reqs.minTrainerLevel) return false;
  if (reqs.allowedTypes && !reqs.allowedTypes.includes(companionType))
    return false;
  if (reqs.requiredSize && companionSize !== reqs.requiredSize) return false;
  if (reqs.minNaturalWeapons && naturalWeaponCount < reqs.minNaturalWeapons)
    return false;

  if (reqs.requiredTricks) {
    const existingNames = existingTricks.map((t) => t.name);
    if (!reqs.requiredTricks.every((rt) => existingNames.includes(rt)))
      return false;
  }

  // Se não pode repetir e já possui, não está disponível
  if (!reqs.canRepeat && existingTricks.some((t) => t.name === trick.name))
    return false;

  return true;
}

export function getAvailableTricks(
  trainerLevel: number,
  companionType: CompanionType,
  companionSize: CompanionSize,
  existingTricks: CompanionTrick[],
  naturalWeaponCount: number,
  isCreation: boolean
): CompanionTrickDefinition[] {
  return COMPANION_TRICKS.filter((trick) =>
    isTrickAvailable(
      trick,
      trainerLevel,
      companionType,
      companionSize,
      existingTricks,
      naturalWeaponCount,
      isCreation
    )
  );
}
