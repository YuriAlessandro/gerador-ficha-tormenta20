import { Atributo } from '../../data/systems/tormenta20/atributos';
import { ClassPower } from '../../interfaces/Class';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../../interfaces/Poderes';
import Skill, {
  ALL_SPECIFIC_OFICIOS,
  isGenericOficio,
  isOficioSkill,
} from '../../interfaces/Skills';
import { isClassOrVariantOf, isRaceOrVariantOf } from '../general';
import { applyRequirementNot } from '../powers';
import { PowerLike, sheetSatisfiesPowerRequirement } from './hasPowerNamed';
import { formatRequirement } from '../requirementText';

/**
 * Avaliação de pré-requisito **item a item**, para a UI poder dizer *qual*
 * requisito falhou em vez de só pintar o poder de vermelho.
 *
 * Nasceu da fusão de `checkRequirements` e `checkClassPowerRequirements`, duas
 * cópias de ~140 linhas que viviam dentro do editor de poderes e haviam
 * divergido em silêncio (só a de classe tratava `DEVOTO`; só a geral tratava
 * `CLASSE` e o `'all'` de `PROFICIENCIA`). Esta versão preserva a **união** dos
 * casos que as duas tratavam — o que corrige, de quebra, poderes de classe com
 * pré-requisito de classe ou de proficiência genérica, que antes caíam no
 * `default: true` e ficavam sempre liberados.
 *
 * Por que não reusar `isPowerAvailable`/`evaluateRule` de `functions/powers.ts`:
 * aquele avaliador lê só a ficha salva. O editor precisa avaliar contra os
 * poderes **marcados na sessão e ainda não salvos**, senão marcar o pré-requisito
 * e o poder que depende dele na mesma visita nunca destrava a segunda linha.
 *
 * Divergência conhecida e deliberada em relação a `evaluateRule`: os tipos
 * `PODER_TORMENTA`, `TIPO_ARCANISTA`, `MAGIA` e `TEXT` caem no `default` e são
 * considerados atendidos. É o comportamento que o editor sempre teve; tratá-los
 * aqui tornaria indisponíveis poderes que hoje aparecem disponíveis, e essa é
 * uma mudança de regra que não cabe num overhaul visual.
 */

/**
 * Qual escopo o `TIER_LIMIT` conta. É a única regra que muda conforme o poder
 * avaliado: para um poder geral ele conta poderes gerais; para um de classe,
 * poderes de classe.
 */
export type PowerKind = 'general' | 'class';

export interface RequirementContext {
  sheet: CharacterSheet;
  /** Poderes gerais marcados no editor e ainda não salvos. */
  pendingGeneralPowers?: PowerLike[];
  /** Poderes de classe marcados no editor e ainda não salvos. */
  pendingClassPowers?: PowerLike[];
}

export interface EvaluatedRequirement {
  requirement: Requirement;
  met: boolean;
  /** Texto pronto do requisito, via `formatRequirement` (respeita `not`). */
  label: string;
  /**
   * O lado do personagem na comparação, quando existe número a mostrar:
   * `'você tem 12'`. `undefined` quando o requisito é booleano e o próprio
   * `label` já diz tudo.
   */
  current?: string;
}

export interface EvaluatedRequirementGroup {
  /** Todos os requisitos do grupo atendidos (E). */
  met: boolean;
  requirements: EvaluatedRequirement[];
}

export interface PowerAvailability {
  available: boolean;
  /** Habilidade racial dispensou os pré-requisitos: não há o que exibir. */
  bypassed: boolean;
  /** Grupos são OU entre si; requisitos dentro do grupo são E. */
  groups: EvaluatedRequirementGroup[];
}

/** Um poder qualquer que carregue pré-requisitos. */
type RequirablePower = Pick<GeneralPower | ClassPower, 'name'> & {
  requirements?: Requirement[][];
};

const ARTESAO_CRIATIVO = 'Artesão Criativo';

/**
 * Todos os nomes de poder que valem como "o personagem tem X", somando a ficha
 * salva e o que está marcado na sessão do editor.
 */
function hasPowerNamed(name: string | undefined, ctx: RequirementContext) {
  if (!name) return false;
  const { sheet, pendingGeneralPowers = [], pendingClassPowers = [] } = ctx;
  const satisfies = (p: PowerLike) =>
    p.name === name || !!p.grantsPowerRequirements?.includes(name);
  return (
    pendingGeneralPowers.some(satisfies) ||
    pendingClassPowers.some(satisfies) ||
    // Cobre os baldes salvos da ficha — inclusive `devoto.poderes`, onde um
    // poder concedido pode viver sozinho — e o hook `grantsPowerRequirements`
    // ("Ginete Altivo", de Hippion, conta como "Ginete").
    sheetSatisfiesPowerRequirement(sheet, name)
  );
}

function isTrainedIn(sheet: CharacterSheet, skillName: string | undefined) {
  return (
    sheet.completeSkills?.some(
      (s) => s.name === skillName && (s.training || 0) > 0
    ) ?? false
  );
}

/** `undefined` quando não há número do lado do personagem para mostrar. */
function currentValueFor(
  req: Requirement,
  ctx: RequirementContext
): string | undefined {
  const { sheet } = ctx;
  switch (req.type) {
    case RequirementType.ATRIBUTO: {
      const value = sheet.atributos[req.name as Atributo]?.value ?? 0;
      return `você tem ${value}`;
    }
    case RequirementType.NIVEL:
      return `você é nível ${sheet.nivel}`;
    default:
      return undefined;
  }
}

function isRequirementMet(
  req: Requirement,
  ctx: RequirementContext,
  kind: PowerKind
): boolean {
  const { sheet, pendingGeneralPowers = [], pendingClassPowers = [] } = ctx;

  switch (req.type) {
    case RequirementType.ATRIBUTO: {
      const attrValue = sheet.atributos[req.name as Atributo]?.value || 0;
      return attrValue >= (req.value || 0);
    }

    case RequirementType.NIVEL:
      return sheet.nivel >= (req.value || 0);

    case RequirementType.PODER:
      return (
        hasPowerNamed(req.name as string, ctx) ||
        (sheet.sheetActionHistory?.some((entry) =>
          entry.changes.some(
            (change) =>
              change.type === 'OptionChosen' && change.chosenName === req.name
          )
        ) ??
          false)
      );

    case RequirementType.PERICIA: {
      // Requisito de Ofício genérico é satisfeito por qualquer Ofício treinado.
      if (isGenericOficio(req.name)) {
        return (
          sheet.completeSkills?.some(
            (s) => isOficioSkill(s.name) && (s.training || 0) > 0
          ) ?? false
        );
      }

      if (isTrainedIn(sheet, req.name as string)) return true;

      // Artesão Criativo: Ofício (Artesão) substitui qualquer outro Ofício
      // específico para fins de pré-requisito.
      if (ALL_SPECIFIC_OFICIOS.includes(req.name as Skill)) {
        return (
          hasPowerNamed(ARTESAO_CRIATIVO, ctx) &&
          isTrainedIn(sheet, Skill.OFICIO_ARTESANATO)
        );
      }

      return false;
    }

    case RequirementType.PROFICIENCIA: {
      // 'all' = qualquer proficiência de arma que não seja Simples.
      if (req.name === 'all') {
        return ['Armas Marciais', 'Armas de Fogo', 'Armas Exóticas'].some(
          (wp) => sheet.classe.proficiencias.includes(wp)
        );
      }
      return sheet.classe.proficiencias.includes(req.name as string);
    }

    case RequirementType.CLASSE:
      // O nome da classe fica em `name` nos dados — mesmo campo que
      // `formatRequirement` lê para montar o texto.
      return isClassOrVariantOf(sheet.classe, req.name as string);

    case RequirementType.DEVOTO: {
      const godName = req.name;
      if (!godName || godName === 'any') return !!sheet.devoto?.divindade;
      return (
        sheet.devoto?.divindade.name.toLowerCase() === godName.toLowerCase()
      );
    }

    case RequirementType.HABILIDADE:
      return sheet.classe.abilities?.some((a) => a.name === req.name) ?? false;

    case RequirementType.RACA:
      // Aceita variantes e "considerado um X para efeitos relacionados a raça".
      return !!req.name && isRaceOrVariantOf(sheet.raca, req.name as string);

    case RequirementType.CHASSIS:
      return sheet.raca.chassis === req.name;

    case RequirementType.HERANCA:
      // Herança do Moreau (ex.: "Moreau da Serpente").
      return sheet.raca.heritage === req.name;

    case RequirementType.TIER_LIMIT: {
      const category = req.name as string;
      const matches = (p: { name: string }) => p.name.includes(category);
      const pending =
        kind === 'class' ? pendingClassPowers : pendingGeneralPowers;
      const saved = kind === 'class' ? sheet.classPowers : sheet.generalPowers;
      return (
        pending.filter(matches).length + (saved?.filter(matches).length ?? 0) <
        1
      );
    }

    default:
      // Tipos não avaliados aqui contam como atendidos. Ver o comentário de
      // divergência no topo do módulo.
      return true;
  }
}

/**
 * Avalia um poder e devolve o veredito **junto com o detalhamento** de cada
 * requisito, para a UI mostrar `✓ Força 15` / `✗ Força 15 — você tem 12`.
 */
export function evaluatePowerRequirements(
  power: RequirablePower,
  ctx: RequirementContext,
  kind: PowerKind = 'general'
): PowerAvailability {
  // Habilidades raciais podem dispensar todos os pré-requisitos de certos
  // poderes (ex.: Centauro "Ginete Natural" → poder "Carga de Cavalaria").
  // O casamento é por SUBSTRING do nome, então os termos cadastrados precisam
  // ser específicos o bastante para não pegar poderes vizinhos.
  const bypassed = (ctx.sheet.raca.abilities ?? []).some((a) =>
    a.bypassPrereqForPowersNamed?.some((term) => power.name.includes(term))
  );
  if (bypassed) return { available: true, bypassed: true, groups: [] };

  if (!power.requirements || power.requirements.length === 0) {
    return { available: true, bypassed: false, groups: [] };
  }

  const groups = power.requirements.map((group) => {
    const requirements = group.map((requirement) => {
      const met = applyRequirementNot(
        requirement,
        isRequirementMet(requirement, ctx, kind)
      );
      return {
        requirement,
        met,
        label: formatRequirement(requirement),
        current: met ? undefined : currentValueFor(requirement, ctx),
      };
    });

    return { met: requirements.every((r) => r.met), requirements };
  });

  return {
    available: groups.some((group) => group.met),
    bypassed: false,
    groups,
  };
}

/** Atalho para quem só precisa do booleano. */
export function isPowerAvailableInEditor(
  power: RequirablePower,
  ctx: RequirementContext,
  kind: PowerKind = 'general'
): boolean {
  return evaluatePowerRequirements(power, ctx, kind).available;
}
