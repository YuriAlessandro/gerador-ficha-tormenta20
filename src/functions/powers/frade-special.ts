import CharacterSheet, { SubStep } from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { spellsCircle2 } from '@/data/systems/tormenta20/magias/generalSpells';
import { DestinyPowers } from '@/data/systems/tormenta20/powers/destinyPowers';
import { addOtherBonusToSkill } from '../skills/general';

// Textos completos de Autoridade Eclesiástica por divindade
export const AUTORIDADE_ECLESIASTICA_TEXTS: Record<string, string> = {
  Aharadak:
    'Você aprende e pode lançar Sussurros Insanos como uma magia divina. Além disso, se estiver em um templo de Aharadak, ou com pelo menos 5 outros devotos do Deus da Tormenta, pode gastar 1 hora para executar um ritual que o aproxima da Anticriação. Se fizer isso, você recebe um embrião rubro, uma larva que se aloja em seu corpo e ocupa 1 espaço. Até o fim da aventura, ou até executar esse ritual novamente, você pode despertar essa larva para receber 1 poder da Tormenta a sua escolha, cujos pré-requisitos cumpra, até o fim da cena. Ao fim da cena, a larva se desaloja e cai no chão como uma pequena poça de visco rubro.',
  Allihanna:
    'Você recebe +5 em Adestramento e Cavalgar, e pode usar essas perícias com animais mesmo sem ser treinado. Além disso, quando descansa em terreno natural, recebe uma bênção dos espíritos locais. Para cada patamar, você recebe 1d4 de auxílio que pode ser adicionado como um bônus em um teste de perícia feito até o fim do dia.',
  Arsenal:
    'Quando visita um templo do Deus da Guerra, você pode orar para que ele abençoe seu arsenal. Escolha uma arma, armadura ou escudo; o item recebe uma melhoria a sua escolha (exceto material especial) cujos pré-requisitos ele cumpra. Essa melhoria não conta no limite de melhorias do item. Se tiver o poder Conjurar Arma, você pode aplicar esse benefício às armas ou munições conjuradas com ele. Esses efeitos duram até o fim da aventura ou até você orar por outra melhoria.',
  Azgher:
    'Você recebe +5 em Sobrevivência. Além disso, uma vez por aventura, se visitar um templo de Azgher, você pode medir o peso de sua alma. Faça um teste de Religião com CD definida pelo mestre: 15 se você seguiu os preceitos de Azgher à risca durante o último mês; 20 se seguiu-os, mas não perfeitamente; 25 se quebrou suas Obrigações & Restrições. Você recebe 1 TO por patamar para cada ponto do resultado acima da CD.',
  Hyninn:
    'Quando chega a uma comunidade, você pode fazer um teste de Sabedoria (CD 10). Se passar, faz contato com ladrões locais; até partir desse lugar, você recebe +5 em testes de Diplomacia para barganha e de Investigação para interrogar. Além disso, uma vez durante sua estadia pode ganhar a ajuda de um parceiro veterano de um tipo a sua escolha entre ajudante (Enganação, Furtividade e Ladinagem), assassino, fortão, perseguidor ou vigilante, que não conta em seu limite de parceiros.',
  Kallyadranoch:
    'Você recebe +5 em Intimidação. Além disso, se visitar um templo de Kallyadranoch, você recebe uma fração da energia dominante do Deus dos Dragões. Durante uma cena a sua escolha, sempre que aplicar uma condição de medo em um ou mais inimigos, você recupera 1d4 PM.',
  Khalmyr:
    'Você recebe +5 em testes de Diplomacia e Intimidação com agentes da lei (cavaleiros, paladinos, guardas e outros, a critério do mestre). Além disso, uma vez por aventura, se estiver em um templo de Khalmyr, você pode solicitar uma escolta: até dois parceiros iniciantes, cada um de um tipo a sua escolha entre combatente, guardião ou médico. Eles o acompanham até o fim da aventura.',
  Lena: 'Você recebe o poder Aparência Inofensiva (se já possuí-lo, a CD para resistir a ele aumenta em +2). Além disso, quando passa um dia descansando em um templo da Deusa da Vida, recebe +1 em testes de resistência e +1 PV por nível até o fim da aventura. A seu critério, aliados que façam o mesmo podem receber esses benefícios.',
  'Lin-Wu':
    'Você recebe +2 em testes de perícia e na CD de suas habilidades contra criaturas treinadas em ao menos uma perícia desonrada (Enganação, Furtividade e Ladinagem) ou que possuam a habilidade Ataque Furtivo.',
  Marah:
    'Você é um conduíte para a beleza de Marah e recebe +1 em Carisma. Além disso, quando usa uma habilidade que cause uma condição entre enfeitiçado, fascinado ou pasmo, pode gastar 2 PM para fazer com que as criaturas afetadas rolem dois dados para seus testes de resistência e usem o pior resultado.',
  Megalokk:
    'Você tem autoridade até mesmo sobre monstros irracionais. A atitude de qualquer monstro com Int –3 ou menor em relação a você aumenta em uma categoria. Se mesmo assim o monstro atacá-lo, você recebe +1 em testes de ataque e rolagens de dano contra ele.',
  Nimb: 'Essa conversa de autoridade não tem muito a ver com Nimb. Você está fora! Uma vez por dia, você pode conferir o status de autoridade de Nimb a outra criatura em alcance curto, que não seja devota do Deus do Caos. A vítima faz um teste de Vontade (CD Sab). Se ela passar, você fica confuso. Contudo, se ela falhar, fica sob efeito das Obrigações & Restrições de Nimb. Além disso, devotos do Deus do Caos procuram a vítima instintivamente, pedindo conselhos, infernizando sua vida e criando caos generalizado. Esse efeito dura um dia e, durante esse tempo, você fica livre das Obrigações & Restrições de Nimb. Conveniente, não?',
  Oceano:
    'Você tem autoridade sobre as águas. Seu deslocamento nadando é dobrado. Além disso, uma vez por dia, se estiver em uma extensão de água natural, como um mar, lago ou rio, pode gastar 1 PM para convocar um animal anfíbio ou aquático, um parceiro iniciante a sua escolha entre combatente, fortão ou guardião, que não conta no seu limite de parceiros. O animal o acompanha até o fim do dia.',
  Sszzaas:
    'Você pode conduzir uma cerimônia especial com devotos do Deus da Traição. Você precisa de no mínimo 3 outros devotos para essa cerimônia, ela dura 1 hora e precisa ser realizada num local totalmente escondido (envolve cânticos profanos e exaltações a Sszzaas). Se fizer isso, para cada outro devoto na cerimônia seu total de PM aumenta em +1 até o fim da aventura e você recebe +1 em Enganação (ambos limitados pelo seu nível). O bônus em Enganação dura indefinidamente, mas diminui em 1 sempre que você fizer um teste dessa perícia.',
  'Tanna-Toh':
    'Você recebe +5 em Conhecimento e em testes de perícia para identificar criatura, item e magia. Além disso, se visitar um templo da Deusa do Conhecimento, tem acesso a todo o conteúdo de sua biblioteca. Escolha uma perícia em que não seja treinado. Até o fim da aventura, ou até usar esse benefício novamente, você recebe os benefícios de ser treinado na perícia escolhida.',
  Tenebra:
    'Se estiver em um templo de Tenebra à noite, você pode conduzir uma cerimônia especial: Súplica à Deusa das Trevas. Isso é uma Missa, mas seus efeitos duram uma semana. Os participantes recebem redução de luz e fogo 5 e seus efeitos de trevas causam um dado extra de dano. À noite, esses benefícios são dobrados.',
  Thwor:
    'Você recebe +5 em qualquer teste de perícias baseadas em Carisma feito para convencer alguém a ajudar a causa duyshidakk (o mestre tem a palavra final sobre as situações em que esse bônus se aplica). Além disso, se visitar um templo de Thwor ou um local qualquer em que haja um diagrama do Akzath como parte da arquitetura, você e quaisquer aliados a sua escolha podem escolher se colocar mais próximos a um lado do Akzath. Escolha entre +10 PV e +1 em testes de perícias, exceto ataques (Vida, Início, Continuidade...) ou +1 em testes de ataque e rolagens de dano (Morte, Fim, Mudança...). Esse benefício dura até o fim da aventura, ou até ser trocado.',
  Thyatis:
    'Você recebe um ícone da fênix, um item esotérico especial que reduz o custo de magias de adivinhação e de fogo em –1 PM (cumulativo com outras reduções) e que conta como um símbolo sagrado de Thyatis. Se perder esse ícone, você pode receber outro visitando um templo do Deus da Ressurreição e da Profecia e fazendo uma doação de T$ 100.',
  Valkaria:
    'Você pode permanecer por uma aventura inteira em um mesmo local, desde que haja um templo de Valkaria a no máximo um dia de distância. Além disso, ao visitar um templo de Valkaria, pode decretar que está em uma "demanda", uma missão envolvendo viagens com um objetivo definido, como recuperar um tesouro ou capturar um vilão. Em uma demanda, você recebe +1 PV por nível e dormir ao relento conta como uma condição de descanso confortável para você, mas dormir sob um teto conta como condição ruim. Esse efeito dura até que a demanda seja cumprida. Se você abandonar a demanda, fica alquebrado até fazer uma penitência.',
  Wynna:
    'Você paga metade do preço por pergaminhos, poções e serviços em templos de Wynna. Além disso, se passar um dia meditando em um templo da Deusa da Magia, recebe uma fração de seu conhecimento místico. Escolha uma magia que você não conheça, arcana ou divina, de até 2º círculo. Até o fim da aventura, ou até usar esse benefício novamente, você pode lançar essa magia pagando seu custo normal.',
};

/**
 * Aplica os efeitos de Autoridade Eclesiástica baseado na divindade do Frade.
 * Os efeitos variam de acordo com a divindade:
 * - Bônus em perícias (fixos na ficha)
 * - Aprender magias
 * - Receber poderes
 * - Efeitos de roleplay (apenas texto descritivo)
 */
export function applyFradeAutoridadeEclesiastica(
  sheet: CharacterSheet
): SubStep[] {
  const subSteps: SubStep[] = [];
  const deityName = sheet.devoto?.divindade?.name;

  if (!deityName) {
    return subSteps;
  }

  // Normaliza o nome da divindade para comparação
  const normalizedDeity = deityName.trim();

  // Obtém o texto específico da divindade para exibir na ficha
  const deityText = AUTORIDADE_ECLESIASTICA_TEXTS[normalizedDeity];
  if (deityText) {
    subSteps.push({
      name: 'Autoridade Eclesiástica',
      value: `${normalizedDeity}: ${deityText}`,
    });
  }

  // Aplica bônus específicos por divindade
  switch (normalizedDeity) {
    case 'Aharadak':
      // Aprende Sussurros Insanos como magia divina
      if (
        !sheet.spells.some((s) => s.nome === spellsCircle2.sussurosInsanos.nome)
      ) {
        sheet.spells.push({
          ...spellsCircle2.sussurosInsanos,
          customKeyAttr: Atributo.SABEDORIA,
        });
        subSteps.push({
          name: 'Autoridade Eclesiástica (Aharadak)',
          value: 'Magia aprendida: Sussurros Insanos',
        });
      }
      break;

    case 'Allihanna':
      // +5 em Adestramento e Cavalgar
      addOtherBonusToSkill(sheet, Skill.ADESTRAMENTO, 5);
      addOtherBonusToSkill(sheet, Skill.CAVALGAR, 5);
      subSteps.push({
        name: 'Autoridade Eclesiástica (Allihanna)',
        value: '+5 em Adestramento e Cavalgar',
      });
      break;

    case 'Azgher':
      // +5 em Sobrevivência
      addOtherBonusToSkill(sheet, Skill.SOBREVIVENCIA, 5);
      subSteps.push({
        name: 'Autoridade Eclesiástica (Azgher)',
        value: '+5 em Sobrevivência',
      });
      break;

    case 'Kallyadranoch':
      // +5 em Intimidação
      addOtherBonusToSkill(sheet, Skill.INTIMIDACAO, 5);
      subSteps.push({
        name: 'Autoridade Eclesiástica (Kallyadranoch)',
        value: '+5 em Intimidação',
      });
      break;

    case 'Khalmyr':
      // +5 em Diplomacia e Intimidação (condicional - agentes da lei)
      // Note: Este é um bônus condicional, então apenas adicionamos ao texto
      // Não implementamos como sheetBonus pois depende da situação
      break;

    case 'Lena':
      // Recebe o poder Aparência Inofensiva
      if (!sheet.generalPowers.some((p) => p.name === 'Aparência Inofensiva')) {
        sheet.generalPowers.push(DestinyPowers.APARENCIA_INOFENSIVA);
        subSteps.push({
          name: 'Autoridade Eclesiástica (Lena)',
          value: 'Poder recebido: Aparência Inofensiva',
        });
      }
      break;

    case 'Lin-Wu':
      // +2 em testes contra criaturas desonradas (condicional)
      // Apenas texto descritivo, não implementável como bônus fixo
      break;

    case 'Marah':
      // +1 em Carisma
      if (sheet.atributos.Carisma) {
        sheet.atributos.Carisma.value += 1;
        sheet.atributos.Carisma.mod = Math.floor(
          (sheet.atributos.Carisma.value - 10) / 2
        );
      }
      subSteps.push({
        name: 'Autoridade Eclesiástica (Marah)',
        value: '+1 em Carisma',
      });
      break;

    case 'Tanna-Toh':
      // +5 em Conhecimento
      addOtherBonusToSkill(sheet, Skill.CONHECIMENTO, 5);
      subSteps.push({
        name: 'Autoridade Eclesiástica (Tanna-Toh)',
        value: '+5 em Conhecimento',
      });
      break;

    // Os demais deuses têm efeitos de roleplay que não podem ser
    // implementados como bônus na ficha (Arsenal, Hyninn, Megalokk,
    // Nimb, Oceano, Sszzaas, Tenebra, Thwor, Thyatis, Valkaria, Wynna)
    default:
      // Nenhum bônus mecânico fixo para esta divindade
      break;
  }

  return subSteps;
}
