import CharacterSheet, {
  SheetAction,
  SheetBonus,
} from '../../interfaces/CharacterSheet';
import { ClassAbility, ClassPower } from '../../interfaces/Class';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  FEITICEIRO_HERANCAS,
  FeiticeiroLinhagemName,
  HERANCA_APRIMORADA,
  HERANCA_SUPERIOR,
  buildLinhagemDraconica,
  feiticeiroPaths,
  parseDraconicaDamageType,
} from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Heranças do Feiticeiro (Tormenta 20 p. 39; Deuses de Arton p. 33).
 *
 * "Herança Aprimorada" e "Herança Superior" são poderes de classe genéricos —
 * o texto do livro é só "você recebe a herança aprimorada de sua linhagem". O
 * que cada um faz depende da linhagem do personagem, então o efeito não cabe no
 * dado do poder: é carimbado aqui na CÓPIA do poder que mora na ficha
 * (`dynamicText` + `sheetBonuses`/`sheetActions`), e os dois motores de
 * derivação passam a aplicá-lo como qualquer outro poder.
 *
 * Só o que é mecânico de ficha é automatizado. Custo de PM e CD por escola,
 * imunidade e efeitos de cena ficam no texto.
 */

type HerancaTier = 'aprimorada' | 'superior';

interface HerancaEffects {
  sheetBonuses?: SheetBonus[];
  sheetActions?: SheetAction[];
  /** "Esta herança conta como um poder da Tormenta (exceto para perda de Carisma)". */
  countsAsTormentaPower?: boolean;
}

const source = (name: string) => ({ type: 'power' as const, name });

const HERANCA_EFFECTS: Record<
  FeiticeiroLinhagemName,
  Partial<Record<HerancaTier, HerancaEffects>>
> = {
  'Linhagem Dracônica': {
    // "soma o dobro do seu Carisma em seus pontos de vida iniciais": a herança
    // básica já soma uma vez; esta soma a segunda.
    superior: {
      sheetBonuses: [
        {
          source: source(HERANCA_SUPERIOR),
          target: { type: 'PV' },
          modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
        },
      ],
    },
  },
  'Linhagem Feérica': {
    // Aumento permanente: `ModifyAttribute` mexe no valor BASE (sobe PM e CD).
    // Um bônus de alvo `Attribute` iria para `atributosTemporarios`.
    superior: {
      sheetActions: [
        {
          source: source(HERANCA_SUPERIOR),
          action: {
            type: 'ModifyAttribute',
            attribute: Atributo.CARISMA,
            value: 2,
          },
        },
      ],
    },
  },
  'Linhagem Rubra': {
    aprimorada: { countsAsTormentaPower: true },
    superior: {
      countsAsTormentaPower: true,
      sheetBonuses: [
        {
          source: source(HERANCA_SUPERIOR),
          target: { type: 'PM' },
          modifier: { type: 'TormentaPowersCalc', formula: '{tPowQtd} * 4' },
        },
      ],
    },
  },
  'Linhagem Abençoada': {
    superior: {
      sheetActions: [
        {
          source: source(HERANCA_SUPERIOR),
          action: {
            type: 'ModifyAttribute',
            attribute: Atributo.SABEDORIA,
            value: 1,
          },
        },
      ],
    },
  },
};

const LINHAGEM_NAMES = Object.keys(
  FEITICEIRO_HERANCAS
) as FeiticeiroLinhagemName[];

const isLinhagemName = (name: string): name is FeiticeiroLinhagemName =>
  (LINHAGEM_NAMES as string[]).includes(name);

export interface FeiticeiroLinhagem {
  name: FeiticeiroLinhagemName;
  /** Só na Linhagem Dracônica. */
  damageType?: string;
}

/**
 * Linhagem do personagem. Na classe principal ela é a habilidade `Linhagem X`
 * em `classe.abilities` (ou `originalAbilities`, antes de o nível liberá-la);
 * em multiclasse, fica em `multiclassSetups`.
 */
export function getFeiticeiroLinhagem(
  sheet: CharacterSheet
): FeiticeiroLinhagem | undefined {
  const ability = [
    ...(sheet.classe?.abilities ?? []),
    ...(sheet.classe?.originalAbilities ?? []),
  ].find((a) => isLinhagemName(a.name));
  if (ability && isLinhagemName(ability.name)) {
    return {
      name: ability.name,
      damageType: parseDraconicaDamageType(ability.text),
    };
  }

  const setup = Object.values(sheet.multiclassSetups ?? {}).find(
    (s) => s.feiticeiroLinhagem
  );
  if (setup?.feiticeiroLinhagem) {
    return {
      name: setup.feiticeiroLinhagem,
      damageType: setup.draconicaDamageType,
    };
  }
  return undefined;
}

const tierOf = (powerName: string): HerancaTier | undefined => {
  if (powerName === HERANCA_APRIMORADA) return 'aprimorada';
  if (powerName === HERANCA_SUPERIOR) return 'superior';
  return undefined;
};

/**
 * Devolve o poder com o texto e os efeitos da herança da linhagem do
 * personagem. Qualquer outro poder (ou uma ficha sem linhagem) volta intacto.
 * Idempotente: o resultado depende só da linhagem.
 */
export function resolveHerancaPower<T extends ClassPower>(
  sheet: CharacterSheet,
  power: T
): T {
  const tier = tierOf(power.name);
  if (!tier) return power;
  const linhagem = getFeiticeiroLinhagem(sheet);
  if (!linhagem) return power;

  const effects = HERANCA_EFFECTS[linhagem.name][tier] ?? {};
  const damageNote = linhagem.damageType
    ? ` Tipo de dano: ${linhagem.damageType}.`
    : '';

  return {
    ...power,
    dynamicText: `${linhagem.name}: ${
      FEITICEIRO_HERANCAS[linhagem.name][tier]
    }${damageNote}`,
    sheetBonuses: effects.sheetBonuses,
    sheetActions: effects.sheetActions,
    countAsTormentaPower: effects.countsAsTormentaPower || undefined,
    tormentaCountExcludesCharisma: effects.countsAsTormentaPower || undefined,
  };
}

/** Carimba as heranças nos poderes de classe da ficha. Muta `sheet`. */
export function syncFeiticeiroHerancas(sheet: CharacterSheet): void {
  if (!Array.isArray(sheet.classPowers)) return;
  if (!sheet.classPowers.some((power) => tierOf(power.name))) return;
  sheet.classPowers = sheet.classPowers.map((power) =>
    resolveHerancaPower(sheet, power)
  );
}

/**
 * Fichas salvas embutem a cópia da habilidade `Linhagem X` de quando ela foi
 * escolhida. Recoloca os efeitos atuais (Enganação da Feérica, RD da
 * Dracônica), preservando o texto — é nele que mora o tipo de dano escolhido.
 */
export function refreshFeiticeiroLinhagemAbility(
  ability: ClassAbility
): ClassAbility {
  if (!isLinhagemName(ability.name)) return ability;
  const current =
    ability.name === 'Linhagem Dracônica'
      ? buildLinhagemDraconica(parseDraconicaDamageType(ability.text))
      : feiticeiroPaths.find((path) => path.name === ability.name);
  // Linhagem Abençoada depende do deus e não mudou: fica como está.
  if (!current) return ability;
  return {
    ...ability,
    sheetBonuses: current.sheetBonuses,
    sheetActions: current.sheetActions,
  };
}
