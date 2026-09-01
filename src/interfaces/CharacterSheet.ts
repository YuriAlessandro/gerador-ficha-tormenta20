import { ClassDescription, ClassPower, CrossTraditionRules } from './Class';
import { GeneralPower, OriginPower } from './Poderes';
import Race, { AttributeVariant, RaceSize, raceSize } from './Race';
import Bag from './Bag';
import { Spell, SpellSchool } from './Spells';
import { CharacterAttributes, CharacterReligion } from './Character';
import Skill, { CompleteSkill } from './Skills';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { BagEquipments, WeaponOverride } from './Equipment';
import { OriginBenefit } from './WizardSelections';
import { CustomPower } from './CustomPower';
import { CompanionSheet } from './Companion';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import type { ActiveEffect } from '../premium/interfaces/ActiveEffect';
import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import type { SheetComplication } from '../premium/interfaces/Complication';
import type { SheetAge } from '../premium/interfaces/Age';
import type { SheetAnimalCompanion } from '../premium/interfaces/AnimalCompanion';
import type { DiceRoll } from './DiceRoll';
import type { PlayerJournal } from './PlayerJournal';

export type SheetChangeSource =
  | {
      type: 'power';
      name: string;
      className?: string;
    }
  | {
      type: 'levelUp';
      level: number;
    }
  | { type: 'origin'; originName: string }
  | { type: 'race'; raceName: string }
  | {
      type: 'class';
      className: string;
    }
  | {
      type: 'divinity';
      divinityName: string;
    }
  | {
      type: 'equipment';
      equipmentName: string;
    }
  | {
      type: 'manualEdit';
    }
  | {
      type: 'condition';
      conditionId: string;
    }
  | {
      type: 'activeEffect';
      powerKey: string;
      name: string;
    }
  | {
      type: 'complication';
      complicationName: string;
    }
  | {
      // Idades Variadas (Heróis de Arton): tanto os efeitos da faixa etária
      // quanto as complicações de idade escolhidas por ela. `ageLabel` guarda o
      // nome da faixa ("Ancião") ou da complicação ("Catarata").
      type: 'age';
      ageLabel: string;
    }
  | {
      // Bônus derivado da categoria de tamanho da criatura (ex.: o passo de
      // dano das armas). Não vem de nenhuma escolha do jogador — é recomputado
      // do `sheet.size` final a cada recálculo.
      type: 'size';
      sizeName: string;
    };

export type SheetAction = {
  source: SheetChangeSource;
  action: SheetActionStep;
};

export type SheetActionStep =
  | {
      type: 'ModifyAttribute';
      attribute: Atributo;
      value: number; // Positive or negative
    }
  | {
      type: 'learnSkill';
      availableSkills: Skill[]; // Maybe modify this to be more flexible or to pick from random
      pick: number; // Number of skills to learn
      // Perícias adicionais por patamar acima de Iniciante (ex.: Biblioteca
      // Divina). Recalculado a cada `recalculateSheet`, concedendo só a
      // diferença em relação ao que já está no histórico (ver `applyPower`).
      perTierAboveIniciante?: number;
    }
  | {
      type: 'learnSpell';
      availableSpells: Spell[]; // List of available spells
      pick: number; // Number of spells to learn
      customAttribute?: Atributo; // Optional custom attribute for the spell
    }
  | {
      type: 'learnAnySpellFromHighestCircle';
      pick: number; // Number of spells to learn
      allowedType: 'Arcane' | 'Divine' | 'Both'; // Allowed types of spells
      schools?: SpellSchool[]; // Optional list of allowed schools
    }
  | {
      type: 'getGeneralPower';
      availablePowers: GeneralPower[]; // List of available powers
      pick: number; // Number of powers to learn
      // Concessões que valem apesar dos pré-requisitos dos poderes ofertados.
      // Linhagem Abençoada (Deuses de Arton, pág. 33) dá um poder concedido
      // "sem precisar ser devoto" — sem isso, o filtro do assistente descarta
      // todos eles pelo requisito DEVOTO e o jogador fica sem opção.
      ignorePrerequisites?: boolean;
    }
  | {
      type: 'addProficiency';
      availableProficiencies: string[]; // List of available proficiencies
      pick: number; // Number of proficiencies to learn
    }
  | {
      type: 'addEquipment';
      equipment: Partial<BagEquipments>; // Partial equipment object to add
      description: string; // Optional description for the equipment
    }
  | {
      type: 'addSense';
      sense: string; // string representing the sense to add
    }
  | {
      type: 'increaseAttribute';
      value?: number; // Quanto aumentar (padrão 1).
      oncePerTier?: boolean; // Limitar a mesma escolha a 1×/patamar (padrão true).
      // Persiste a escolha do jogador (replay sem manualSelections, ex.: homebrew).
      optionKey?: string;
    }
  | {
      type: 'setMaxSpacesAttribute';
      attribute: Atributo;
    }
  | {
      type: 'special';
      specialAction:
        | 'humanoVersatil'
        | 'lefouDeformidade'
        | 'osteonMemoriaPostuma'
        | 'yidishanNaturezaOrganica'
        | 'moreauSapiencia'
        | 'moreauEspertezaVulpina'
        | 'fradeAutoridadeEclesiastica'
        | 'meioElfoAmbicaoHerdada'
        | 'qareenResistenciaElemental'
        | 'almaLivreSelectClass'
        | 'diferentaoSelectClassPower'
        | 'teurgistaMistico'
        | 'mashinChassi';
    }
  | {
      type: 'selectWeaponSpecialization';
      availableWeapons?: string[]; // List of weapon names to choose from, or empty for all weapons
      bonuses?: Array<
        | { kind: 'attack'; value: number }
        | { kind: 'damage'; value: number }
        | { kind: 'damageStep'; steps: number }
      >;
      onlyFromSheet?: boolean; // When true, list only weapons currently in the sheet
      optional?: boolean; // When true, user can pick "no weapon"
    }
  | {
      type: 'selectFamiliar';
      availableFamiliars?: string[]; // List of familiar names to choose from, or empty for all familiars
    }
  | {
      type: 'selectAnimalTotem';
      availableTotems?: string[]; // List of totem names to choose from, or empty for all totems
    }
  | {
      type: 'addTruqueMagicSpells';
    }
  | {
      type: 'addVozCivilizacaoSpell';
    }
  | {
      type: 'buildGolpePessoal';
    }
  | {
      type: 'learnClassAbility';
      availableClasses: string[]; // List of class names to choose from
      level: number; // Level of the ability (usually 1)
    }
  | {
      // Marca perícias que o personagem JÁ é treinado (não concede treinamento).
      // Ex.: "Especialista" do Ladino. A quantidade é dinâmica: o modificador de
      // `pickByAttribute`, com piso `min`.
      type: 'markTrainedSkills';
      pickByAttribute: Atributo;
      min: number;
    }
  | {
      type: 'getClassPower';
      // Nível em que os requisitos são avaliados (default: 2). Ver
      // getFuturaLendaClassPowers.
      minLevel?: number;
    }
  | {
      type: 'grantSpecificClassPower';
      powerName: string; // Name of the specific class power to grant automatically
    }
  | {
      type: 'addAlchemyItems';
      budget: number; // Maximum total price of items
      count: number; // Number of items to add
    }
  | {
      type: 'chooseFromOptions';
      optionKey: string; // Unique key for this choice group (e.g., 'escolaDeDuelo')
      options: Array<{
        name: string;
        text: string;
        sheetBonuses?: SheetBonus[];
        repeatable?: boolean; // Pode ser escolhida mais de uma vez (multi-pick)
        grantedSpells?: Spell[]; // Magias concedidas ao escolher esta opção (fixas)
        // Concessão de magias por ESCOLHA do jogador ao escolher esta opção
        // (jogador seleciona `pick` magias de um pool). Aplicada uma vez na
        // criação/level-up; as magias persistem em `sheet.spells` (não são
        // re-sorteadas no recálculo, como qualquer learnSpell).
        grantedSpellsAction?:
          | {
              type: 'learnSpell';
              availableSpells: Spell[];
              pick: number;
              customAttribute?: Atributo;
            }
          | {
              type: 'learnAnySpellFromHighestCircle';
              pick: number;
              allowedType: 'Arcane' | 'Divine' | 'Both';
              schools?: SpellSchool[];
            };
        // Equipamento concedido ao escolher esta opção (ex.: arma natural).
        // Adicionado à mochila (idempotente por nome) quando a opção é escolhida.
        grantedEquipment?: Partial<BagEquipments>;
        // Poderes concedidos ao escolher esta opção (concessão fixa). Adicionados
        // a `sheet.generalPowers` (idempotente por nome) e seus `sheetActions`
        // são cascateados (como em `getGeneralPower`).
        grantedPowers?: GeneralPower[];
        // Poderes concedidos POR ESCOLHA do jogador ao escolher esta opção
        // (seleciona `pick` poderes do pool). Aplicado uma vez na criação/level-up.
        grantedPowersAction?: {
          type: 'getGeneralPower';
          availablePowers: GeneralPower[];
          pick: number;
        };
        // Efeitos ativos (ativáveis em jogo) e rolagens concedidos pela opção —
        // anexados ao poder/habilidade dono quando a opção é escolhida ("sub-poder").
        customEffects?: CustomEffect[];
        rolls?: DiceRoll[];
        // Ações desta opção — cascateadas com `applyPower` como se pertencessem
        // ao poder/habilidade dono (mesmo `name`, então as seleções manuais do
        // jogador casam pela mesma chave). Permite expressar "A OU escolha N de B"
        // (ex.: Herança de Werra: armas marciais ou duas armas exóticas).
        // Os requisitos de escolha aninhados só aparecem no assistente depois que
        // a opção é escolhida — ver `getChosenOptionNestedRequirements`.
        sheetActions?: SheetAction[];
      }>;
      pick?: number; // Quantas seleções o jogador faz (padrão 1). >1 = multi-pick.
      // Novas escolhas ao subir de nível. `substitutes` indica se cada pick novo
      // é concedido no lugar do poder de classe/geral daquele nível.
      levelUp?: {
        pickPerLevelUp: number;
        substitutes: 'none' | 'classPower' | 'generalPower';
      };
      linkedTo?: string; // If set, auto-select the option matching a previous choice stored under this key
      // Quando presente, o NOME da opção escolhida deve ser um `Atributo` e é
      // gravado no campo escalar correspondente da ficha (Tradição Perdida):
      // 'pm' → `tradicaoPerdidaPmAttribute`; 'cd' → `spellPath.keyAttribute`
      // (ou `overrideKeyAttribute`). Só é aplicado no apply "fresco" (escolha
      // ativa do jogador), nunca no replay do recálculo — assim edições manuais
      // posteriores no editor prevalecem. Sem sorteio aleatório de fallback.
      applyChosenAttributeTo?: 'pm' | 'cd';
    }
  | {
      type: 'trainSkillOrBonus';
      skills: Skill[]; // Skills to choose from (if > 1, pick one randomly)
    };

export type SheetActionReceipt =
  | {
      type: 'Attribute';
      attribute: Atributo;
      value: number; // Positive or negative
    }
  | {
      type: 'MaxSpacesAttributeSet';
      attribute: Atributo;
    }
  | {
      type: 'SkillsAdded';
      skills: Skill[];
    }
  | {
      type: 'SpellsLearned';
      spellNames: string[];
    }
  | {
      type: 'SenseAdded';
      sense: string;
    }
  | {
      type: 'PowerAdded';
      powerName: string;
    }
  | {
      type: 'ClassPowerAdded';
      powerName: string;
    }
  | {
      type: 'ProficiencyAdded';
      proficiency: string;
    }
  | {
      type: 'EquipmentAdded';
      equipment: Partial<BagEquipments>;
    }
  | {
      type: 'AttributeIncreasedByAumentoDeAtributo';
      attribute: Atributo;
      plateau: number; // Plateau number for the increase
    }
  | {
      type: 'ClassAbilityLearned';
      className: string;
      abilityName: string;
    }
  | {
      // Perícias marcadas por `markTrainedSkills` (ex.: Especialista do Ladino).
      // Não alteram número nenhum na ficha — são registro para o uso do poder.
      type: 'TrainedSkillsMarked';
      skills: Skill[];
    }
  | {
      type: 'OptionChosen';
      optionKey: string;
      chosenName: string;
      formattedText: string;
    }
  | {
      type: 'SkillTrainedOrBonused';
      skill: Skill;
      alreadyTrained: boolean; // true = got +2 bonus, false = newly trained
    }
  | {
      type: 'FamiliarSelected';
      familiarKey: string;
    }
  | {
      type: 'WeaponSpecializationSelected';
      weaponName: string;
    }
  | {
      type: 'AnimalTotemSelected';
      totemKey: string;
      spellName: string;
    }
  | {
      type: 'CompanionTrickLearned';
      companionIndex: number;
      trickName: string;
      choices?: Record<string, string>;
      spellName?: string;
    };

export type SheetActionHistoryEntry = {
  source: SheetChangeSource;
  powerName?: string; // Name of the power that caused this action
  changes: SheetActionReceipt[];
};

export type StatModifierTarget =
  | {
      type: 'Skill';
      name: Skill;
    }
  | {
      type: 'PV';
    }
  | {
      type: 'PM';
    }
  | {
      type: 'Defense';
    }
  | {
      type: 'Displacement';
    }
  | {
      type: 'MaxSpaces';
    }
  | {
      type: 'ArmorPenalty';
    }
  | {
      type: 'PickSkill';
      skills: Skill[];
      pick: number; // Number of skills to pick
      // Persiste a escolha do jogador para sobreviver ao recálculo (homebrew).
      optionKey?: string;
    }
  | {
      // Treina uma ou mais perícias (não um bônus numérico — marca a perícia
      // como treinada). Marcador usado pelo editor de homebrew; convertido na
      // ação `learnSkill` no compile. `pick` < `skills.length` = o jogador
      // escolhe `pick` perícias da lista; senão todas as listadas são treinadas.
      type: 'TrainSkill';
      skills: Skill[];
      pick: number;
    }
  | {
      // Atributo escolhido pelo jogador (compila para a ação `increaseAttribute`).
      // Marcador usado pelo editor de homebrew; convertido em ação no compile.
      type: 'PickAttribute';
      pick: number;
      oncePerTier?: boolean;
    }
  | {
      type: 'ModifySkillAttribute';
      skill: Skill;
      attribute: Atributo;
    }
  | {
      type: 'WeaponDamage';
      weaponName?: string; // Specific weapon name
      weaponTags?: string[]; // Weapon tags to match
      proficiencyRequired?: boolean; // Whether proficiency is required
      meleeOnly?: boolean; // Apenas armas corpo a corpo (exclui armas à distância)
      rangedOnly?: boolean; // Apenas armas à distância (exclui corpo a corpo)
      thrownOnly?: boolean; // Apenas armas de arremesso (aplicado por modo de ataque em Weapon.tsx)
      firingOnly?: boolean; // Apenas armas de disparo (à distância e NÃO arremesso — arcos, bestas, fogo, funda)
      lightOrAgileOnly?: boolean; // Apenas armas corpo a corpo leves ou ágeis (lista em weaponTraits.ts)
      twoHandedOnly?: boolean; // Apenas armas empunhadas com as duas mãos (`twoHanded`)
      // Escopo por categoria de proficiência da arma (vazio/ausente = qualquer).
      weaponCategories?: ('simple' | 'martial' | 'exotic' | 'firearm')[];
    }
  | {
      type: 'WeaponAttack';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
      meleeOnly?: boolean; // Apenas armas corpo a corpo (exclui armas à distância)
      rangedOnly?: boolean; // Apenas armas à distância (exclui corpo a corpo)
      thrownOnly?: boolean; // Apenas armas de arremesso (aplicado por modo de ataque em Weapon.tsx)
      firingOnly?: boolean; // Apenas armas de disparo (à distância e NÃO arremesso — arcos, bestas, fogo, funda)
      lightOrAgileOnly?: boolean; // Apenas armas corpo a corpo leves ou ágeis (lista em weaponTraits.ts)
      twoHandedOnly?: boolean; // Apenas armas empunhadas com as duas mãos (`twoHanded`)
      // Escopo por categoria de proficiência da arma (vazio/ausente = qualquer).
      weaponCategories?: ('simple' | 'martial' | 'exotic' | 'firearm')[];
    }
  | {
      type: 'WeaponThreatMargin';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
      meleeOnly?: boolean;
      rangedOnly?: boolean;
      thrownOnly?: boolean;
      firingOnly?: boolean; // Apenas armas de disparo (à distância e NÃO arremesso — arcos, bestas, fogo, funda)
      lightOrAgileOnly?: boolean; // Apenas armas corpo a corpo leves ou ágeis (lista em weaponTraits.ts)
      twoHandedOnly?: boolean; // Apenas armas empunhadas com as duas mãos (`twoHanded`)
      weaponCategories?: ('simple' | 'martial' | 'exotic' | 'firearm')[];
      // 'increase' (padrão): alarga a margem pelo valor; 'set': define a margem
      // (ex.: "sua margem de ameaça passa a ser 19").
      mode?: 'increase' | 'set';
    }
  | {
      type: 'WeaponCriticalMultiplier';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
      meleeOnly?: boolean;
      rangedOnly?: boolean;
      thrownOnly?: boolean;
      firingOnly?: boolean; // Apenas armas de disparo (à distância e NÃO arremesso — arcos, bestas, fogo, funda)
      lightOrAgileOnly?: boolean; // Apenas armas corpo a corpo leves ou ágeis (lista em weaponTraits.ts)
      twoHandedOnly?: boolean; // Apenas armas empunhadas com as duas mãos (`twoHanded`)
      weaponCategories?: ('simple' | 'martial' | 'exotic' | 'firearm')[];
      // 'increase' (padrão): soma ao multiplicador; 'set': define o multiplicador
      // (ex.: "seu multiplicador de crítico passa a ser x3").
      mode?: 'increase' | 'set';
    }
  | {
      type: 'WeaponDamageStep';
      weaponName?: string;
      weaponTags?: string[];
      proficiencyRequired?: boolean;
    }
  | {
      /**
       * Passo de dado do ATAQUE DESARMADO (Corpo Aberrante, e o que mais vier).
       *
       * Estritamente disjunto de `WeaponDamageStep`: aquele só é bakeado nas
       * armas de `bag.equipments.Arma`, e ataque desarmado NÃO é uma arma da
       * mochila — não existe item "Desarmado" no catálogo. Manter os dois alvos
       * separados é o que impede o passo de tamanho de ser contado duas vezes:
       * o Step 11.7 emite o de tamanho como `WeaponDamageStep`, e
       * `unarmedDamage.ts` lê o tamanho direto de `sheet.size`.
       *
       * Por isso vale a regra: NUNCA emitir um `UnarmedDamageStep` cuja
       * `source` seja `{ type: 'size' }`.
       */
      type: 'UnarmedDamageStep';
    }
  | {
      type: 'HPAttributeReplacement';
      newAttribute: Atributo;
    }
  | {
      type: 'SpellDC';
    }
  | {
      type: 'DamageReduction';
      damageType: DamageType;
    }
  | {
      type: 'Attribute';
      attribute: Atributo;
    }
  | {
      type: 'DisplacementOverride';
    }
  | {
      // Troca a categoria de tamanho da criatura (ex.: Forma Selvagem do
      // Druida). Os modificadores de Furtividade/manobra saem de graça: a
      // ficha lê `size.modifiers` no render. O `modifier` do bônus é
      // irrelevante (a troca é categórica, não numérica).
      type: 'SizeOverride';
      size: raceSize;
    }
  | {
      // Desloca a categoria de tamanho em N degraus (+1 = uma acima, -1 = uma
      // abaixo), com clamp entre Minúsculo e Colossal. Relativo de propósito:
      // efeitos como a magia Alterar Tamanho são ofertados a aliados da mesa e
      // precisam resolver contra o tamanho DO ALVO, não o do conjurador. Vários
      // `SizeSteps` somam, e o total é aplicado por cima de um `SizeOverride`
      // absoluto quando os dois existem. Como no `SizeOverride`, o `modifier`
      // do bônus é irrelevante.
      type: 'SizeSteps';
      steps: number;
    }
  | {
      // Concede um deslocamento secundário (voo, escalada, natação, escavação).
      // `set` (padrão) mantém o MAIOR valor entre o manual e o do bônus; `add`
      // soma ao que já existe. Alimenta `computedMovementTypes` — nunca escreve
      // no campo manual `movementTypes`.
      type: 'MovementType';
      movement: keyof Omit<MovementTypes, 'pairar'>;
      mode?: 'set' | 'add';
    }
  | {
      type: 'AllAttackBonus';
    }
  | {
      // Concede uma proficiência (ex.: 'Armas Marciais'). O modificador é
      // irrelevante (a concessão é booleana); aplicado adicionando à lista
      // `classe.proficiencias` se ainda não estiver presente.
      type: 'Proficiency';
      proficiency: string;
    }
  | {
      // Arremesso Potente: permite usar Força no teste de ataque com armas de
      // arremesso. Aplicado por modo de ataque em Weapon.tsx (max(For, Des)).
      type: 'ThrownAttackUseStrength';
    };

export type StatModifier =
  | {
      type: 'Attribute';
      attribute: Atributo;
    }
  | {
      type: 'LevelCalc';
      formula: string;
    }
  | {
      type: 'TormentaPowersCalc';
      formula: string;
    }
  | {
      type: 'SpecialAttribute';
      attribute: 'spellKeyAttr';
    }
  | {
      type: 'Fixed';
      value: number;
    }
  | {
      type: 'CappedAttribute';
      attribute: Atributo;
      capBy: 'level' | 'classLevel';
    }
  | {
      // Valor que muda por faixa de nível: usa o `value` do maior `fromLevel`
      // que seja <= nível atual (0 se nenhum). Avaliado nativamente (sem fórmula
      // nem eval). `by` define se escala pelo nível total ou de classe.
      type: 'LevelBreakpoints';
      breakpoints: { fromLevel: number; value: number }[];
      by?: 'level' | 'classLevel';
    }
  | {
      // Valor a partir de uma fonte (fixo / nível do personagem / círculo máximo
      // de magia / atributo), opcionalmente limitado (min) pelo nível e/ou por um
      // atributo. Ex.: "dano = círculo de magia, limitado pelo nível". Avaliado
      // nativamente (sem eval). Genérico, mas hoje usado pelo bônus de Dano.
      type: 'ScaledValue';
      base:
        | { kind: 'fixed'; value: number }
        | { kind: 'level' }
        | { kind: 'spellCircle' }
        | { kind: 'attribute'; attribute: Atributo };
      capByLevel?: boolean;
      capByAttribute?: Atributo;
    };

/** Operador de comparação numérica para condições de bônus. */
export type BonusConditionOp = 'gte' | 'lte' | 'eq';

/**
 * Cláusula atômica de uma condição de aplicação de bônus. Cada cláusula inspeciona
 * um aspecto estável da ficha (equipamento empunhado, armadura, classe, nível,
 * atributo, poder, perícia, devoção, raça). `negate` inverte a cláusula.
 */
export type BonusConditionClause = (
  | { kind: 'wearingHeavyArmor' }
  | { kind: 'wearingArmor' }
  /** Vestindo a armadura de nome exato `value` (identidade de catálogo). */
  | { kind: 'wearingArmorNamed'; value: string }
  | { kind: 'wieldingShield' }
  | { kind: 'wieldingItemNamed'; value: string }
  | { kind: 'wieldingTwoHandedWeapon' }
  | { kind: 'wieldingMeleeWeapon' }
  | { kind: 'wieldingRangedWeapon' }
  | { kind: 'dualWielding' }
  | { kind: 'level'; op: BonusConditionOp; value: number }
  | {
      kind: 'attribute';
      attribute: Atributo;
      op: BonusConditionOp;
      value: number;
    }
  | { kind: 'isClass'; value: string }
  | { kind: 'hasPower'; value: string }
  | { kind: 'hasProficiency'; value: string }
  | { kind: 'hasSkill'; value: Skill }
  | { kind: 'devoteOf'; value: string }
  | { kind: 'isRace'; value: string }
) & { negate?: boolean };

/**
 * Condição opcional de aplicação de um `SheetBonus`. Quando presente, o bônus só
 * é aplicado se a condição for satisfeita. `combinator` define se TODAS (`AND`)
 * ou QUALQUER (`OR`) das cláusulas precisam ser verdadeiras. Genérico — qualquer
 * fonte de conteúdo pode usar (ver `src/functions/bonusConditions.ts`).
 */
export type BonusCondition = {
  combinator: 'AND' | 'OR';
  clauses: BonusConditionClause[];
};

export type SheetBonus = {
  source: SheetChangeSource;
  target: StatModifierTarget;
  modifier: StatModifier;
  /** Quando presente, o bônus só é aplicado se a condição for satisfeita. */
  condition?: BonusCondition;
};

export type DamageType =
  | 'Geral'
  | 'Ácido'
  | 'Corte'
  | 'Eletricidade'
  | 'Essência'
  | 'Fogo'
  | 'Frio'
  | 'Impacto'
  | 'Luz'
  | 'Perfuração'
  | 'Psíquico'
  | 'Trevas';

export type DamageReduction = Partial<Record<DamageType, number>>;

export const ALL_DAMAGE_TYPES: DamageType[] = [
  'Geral',
  'Ácido',
  'Corte',
  'Eletricidade',
  'Essência',
  'Fogo',
  'Frio',
  'Impacto',
  'Luz',
  'Perfuração',
  'Psíquico',
  'Trevas',
];

export interface MovementTypes {
  escalada?: number;
  escavar?: number;
  natacao?: number;
  voo?: number;
  pairar?: boolean;
}

export interface ClassLevelEntry {
  level: number;
  className: string;
  classSubname?: string;
}

/**
 * Regras opcionais de Heróis de Arton (cap. 4) em uso nesta ficha.
 *
 * Complicações NÃO entram aqui — têm campo próprio (`complication`) desde antes
 * deste bloco. As flags abaixo são registradas na criação e servem tanto de
 * auditoria quanto de gate para a edição pós-criação: mesmo que o usuário perca
 * o acesso à feature, quem já tem a regra na ficha continua podendo removê-la.
 */
export interface SheetOptionalRules {
  /** Raças Abertas (p. 281): modificadores raciais distribuídos livremente. */
  openRaces?: boolean;
  /** Devoções Abertas (p. 281): devoto de qualquer divindade. */
  openDeities?: boolean;
  /** Morte por Velhice (p. 291): marcador de mesa, sem mecânica automática. */
  deathByOldAge?: boolean;
  /**
   * Variante de Atributos Variados usada na criação (ex.: 'classica', 'nimb').
   * Informativo: os atributos já saem calculados, isto só registra a origem.
   */
  attributeMethodVariant?: string;
}

// TODO: Once all type errors are fixed, change this into a proper class with constructor and stuff.
export default interface CharacterSheet {
  id: string;
  nome: string;
  sexo: string;
  nivel: number;
  atributos: CharacterAttributes;
  raca: Race;
  classe: ClassDescription;
  skills: Skill[];
  pv: number;
  pm: number;
  sheetBonuses: SheetBonus[];
  sheetActionHistory: SheetActionHistoryEntry[];
  /**
   * Ids de suplementos registrados em runtime (ex.: `homebrew:<id>`) que esta
   * ficha utiliza. Carimbado no recálculo: recalcula para os runtime ativos e
   * preserva entradas de runtime inativos (não verificáveis). Usado para
   * bloquear desativação/carregamento quando o conteúdo runtime some.
   */
  usedSupplements?: string[];
  /**
   * Escolhas persistidas de ações `chooseFromOptions`, indexadas por `optionKey`
   * → nomes das opções escolhidas (com repetição quando a opção é repetível ou
   * o pick é múltiplo). Diferente do `sheetActionHistory`, este mapa NÃO é
   * deduplicado, então sobrevive a recálculos sem perder picks múltiplos nem
   * acumular escolhas de subida de nível. O motor lê este mapa para reproduzir
   * as escolhas quando nenhuma seleção manual é passada (caminho comum de edição
   * e do recálculo final pós-level-up).
   */
  optionChoices?: Record<string, string[]>;
  defesa: number;
  bag: Bag;
  // Currently wielded items (Equipment.id references). Optional — when both are
  // undefined, the legacy "everything in the bag is equipped" behavior applies
  // (preserves backwards compatibility for sheets created before this feature).
  mainHandItemId?: string;
  offHandItemId?: string;
  // Currently worn armor (Equipment.id reference). When undefined and there is
  // exactly 1 armor in the bag, that armor implicitly applies (legacy compat).
  // When undefined with ≥2 armors, NONE applies — the sheet shows a banner
  // asking the player to pick.
  wornArmorId?: string;
  // Set to `true` after `migrateLegacyEquipState` ran on this sheet. Prevents
  // the auto-equip migration from running again and overriding deliberate
  // choices made by the player after the migration.
  equipStateMigrated?: boolean;
  /**
   * Peças de `Vestuário` que o jogador GUARDOU na mochila (não está vestindo).
   * É um conjunto de OPT-OUT de propósito: `undefined`/ausente significa "nada
   * guardado", logo tudo vestido — exatamente o comportamento de toda ficha
   * criada antes desta feature. Por isso NÃO existe migração aqui e nenhuma
   * ficha antiga muda de número.
   *
   * A inversão também protege os caminhos que colocam Vestuário na mochila SEM
   * passar pela Mochila (recompensa de tesouro, itens de origem, pacote de item
   * homebrew, geração aleatória): a peça nova nunca está no conjunto, então
   * nasce vestida. Uma lista positiva ("o que está vestido") faria essas peças
   * perderem o bônus em silêncio.
   *
   * Ao esvaziar, volta a `undefined` (ver `applyClothingWorn`) para manter o
   * payload limpo — `stripSheetForStorage` remove a chave e o delta vira
   * `$unset`, que é a representação correta de "nada guardado".
   */
  unwornClothingIds?: string[];
  // Backpack visual mode: when `true`, items are grouped by category in the
  // modal grid; otherwise flat. Per-sheet because different characters benefit
  // from different layouts (e.g. inventory-heavy vs. minimal kits).
  backpackGroupByCategory?: boolean;
  // Mochila: quando `true` (o padrão para ficha legada, que grava `undefined`),
  // adicionar um item desconta o preço do saldo em T$. Por ficha porque cada
  // personagem tende a viver num modo — um em campanha, gastando consumíveis,
  // outro em fase de compras.
  backpackAutoDeductMoney?: boolean;
  devoto?: CharacterReligion;
  origin:
    | {
        name: string;
        powers: OriginPower[];
        selectedBenefits?: OriginBenefit[]; // Track which benefits were chosen (for editing)
        // Itens da origem escolhidos pelo jogador: `choice.key` -> nome do item.
        // Permite reeditar a escolha depois da criação.
        itemChoices?: Record<string, string>;
        // Ids, na mochila, dos itens concedidos pela origem. É o que permite
        // trocar/remover esses itens sem mexer no resto do inventário.
        grantedItemIds?: string[];
        // Perícias da origem escolhidas pelo jogador: `choice.key` -> nome da
        // perícia (ex.: qual Ofício). Permite reeditar a escolha depois da criação.
        skillChoices?: Record<string, string>;
      }
    | undefined;
  spells: Spell[];
  displacement: number;
  size: RaceSize;
  maxSpaces: number;
  maxSpacesAttribute?: Atributo;
  manualMaxSpacesAttribute?: Atributo;
  customMaxSpaces?: number; // Manual override for max spaces
  customDisplacement?: number; // Manual override for displacement
  customSize?: RaceSize; // Manual override for size
  /**
   * Snapshot do tamanho anterior a uma troca por bônus `SizeOverride` (Forma
   * Selvagem). Só existe ENQUANTO houver um override ativo — o Step 11.5 do
   * `recalculateSheet` cria na primeira troca e descarta ao restaurar. Não é
   * um campo editável pelo usuário.
   */
  baseSize?: RaceSize;
  movementTypes?: MovementTypes; // Tipos de deslocamento secundários (manual)
  /**
   * Deslocamentos secundários DERIVADOS: `movementTypes` (manual) mesclado com
   * os bônus `MovementType`. Espelha o par `bonusRd` (manual) /
   * `reducaoDeDano` (computado) da redução de dano. Ausente quando não há
   * nenhum bônus — nesse caso a UI cai em `movementTypes`.
   */
  computedMovementTypes?: MovementTypes;
  generalPowers: GeneralPower[];
  customPowers?: CustomPower[];
  customGrantedPowers?: CustomPower[];
  classPowers?: ClassPower[];
  powersOrder?: string[];
  steps: Step[];
  extraArmorPenalty?: number;
  completeSkills?: CompleteSkill[];
  sentidos?: string[];
  dinheiro?: number;
  dinheiroTC?: number;
  dinheiroTO?: number;
  isThreat?: boolean;
  raceAttributeChoices?: Atributo[]; // Manual choices for 'any' race attributes
  selectedAttributeVariant?: AttributeVariant; // Selected attribute variant (e.g., Kallyanach +2x1 vs +1x2)
  raceHeritage?: string; // For races with heritages (like Moreau)
  raceChassis?: string; // For Golem Desperto
  raceEnergySource?: string; // For Golem Desperto
  raceSizeCategory?: string; // For Golem Desperto (pequeno/medio/grande)
  suragelAbility?: string; // For Suraggel (Aggelus/Sulfure) alternative abilities
  duendeNature?: string; // For Duende (animal/vegetal/mineral)
  duendePresentes?: string[]; // For Duende (3 selected powers)
  duendeTabuSkill?: string; // For Duende (skill with -5 penalty)
  duendeBonusAttributes?: Atributo[]; // For Duende: chosen Dons (2 attrs, + 3rd if Animal)
  qareenElement?: DamageType; // For Qareen (chosen elemental resistance)
  cavaleiroCaminho?: 'Bastião' | 'Montaria'; // For Cavaleiro (path choice at level 5)
  // Seleções persistentes de habilidades de raça (evita re-seleção aleatória durante recalculação)
  humanoVersatilSkill?: string; // Perícia escolhida por Versátil (Humano)
  humanoVersatilChoice?:
    | { type: 'skill'; value: string }
    | { type: 'power'; value: string }
    | { type: 'cleared' }; // Segunda escolha
  lefouDeformidadeSkills?: string[]; // Perícias escolhidas por Deformidade (Lefou)
  lefouDeformidadePower?: string; // Poder da Tormenta escolhido (se aplicável)
  osteonMemoriaPostumaChoice?:
    | { type: 'skill' | 'power' | 'raceAbility'; value: string }
    | { type: 'cleared' }; // Escolha de Memória Póstuma
  yidishanNaturezaChoice?:
    | { type: 'skill' | 'power' | 'raceAbility'; value: string }
    | { type: 'cleared' }; // Escolha de Natureza Orgânica
  meioElfoAmbicaoType?: 'generalPower' | 'originPower' | 'cleared'; // Tipo de Ambição Herdada
  meioElfoAmbicaoPower?: string; // Nome do poder escolhido por Ambição Herdada
  mashinChassiSkill?: string; // Perícia escolhida por Chassi Mashin
  mashinChassiChoice?:
    | { type: 'skill'; value: string }
    | { type: 'power'; value: string }
    | { type: 'cleared' }; // Segunda escolha
  moreauSapienciaSpell?: string; // Magia escolhida por Sapiência (Moreau)
  moreauEspertezaSkills?: [string, string]; // Perícias escolhidas por Esperteza Vulpina (Moreau)
  customPVPerLevel?: number; // Custom PV per level (overrides classe.addpv if defined)
  customPMPerLevel?: number; // Custom PM per level (overrides classe.addpm if defined)
  bonusPV?: number; // Bonus PV added to total
  bonusPM?: number; // Bonus PM added to total
  customDefenseBase?: number; // Custom base defense (overrides 10 if defined)
  customDefenseAttribute?: Atributo; // Custom attribute for defense (overrides DES/CAR)
  useDefenseAttribute?: boolean; // Whether to use attribute mod (false = ignore even without heavy armor)
  bonusDefense?: number; // Manual defense bonus
  bonusSpellDC?: number; // Manual bonus to spell DC (Teste de Resistência)
  /**
   * Modificador temporário por atributo registrado À MÃO pelo jogador (magia
   * não modelada, decisão do mestre, item). É o par MANUAL de
   * `atributosTemporarios`, como `bonusRd` é de `reducaoDeDano`.
   *
   * Só guarda chaves != 0; vazio vira `undefined` para o delta da nuvem virar
   * `$unset`. Fora de `NEVER_UNSET_SHEET_KEYS`: zerar é operação legítima.
   */
  bonusAtributos?: Partial<Record<Atributo, number>>;
  /**
   * DERIVADO — total do modificador temporário de cada atributo, recomputado do
   * zero no Step 7.46 do `recalculateSheet` a partir de TODO `sheetBonus` com
   * alvo `Attribute` (efeitos ativos, Forma Selvagem, efeitos customizados e a
   * injeção de `bonusAtributos`).
   *
   * O motor NUNCA muta `atributos[attr].value` — isso já foi tentado e vazava
   * efeito temporário para o estado persistido. Este campo é a camada de
   * "atributo efetivo" que fica por cima; ler sempre via
   * `functions/effectiveAttributes.ts`.
   *
   * É derivado mas persiste de propósito: fichas chegam por socket e
   * compartilhamento de mesa e são renderizadas SEM passar por
   * `recalculateSheet` — sem persistir, o parceiro veria os valores base.
   */
  atributosTemporarios?: Partial<Record<Atributo, number>>;
  manualPMEdit?: number; // Manual PM adjustment (added after calculation)
  manualPVEdit?: number; // Manual PV adjustment (added after calculation)
  // Manual PM/PV control (for gameplay tracking and manual overrides)
  currentPM?: number; // Current PM during gameplay (consumed resources)
  currentPV?: number; // Current PV during gameplay (damage taken)
  manualMaxPM?: number; // Manual override for maximum PM (replaces calculated value if set)
  manualMaxPV?: number; // Manual override for maximum PV (replaces calculated value if set)
  pmIncrement?: number; // Increment value for PM +/- buttons (default: 1)
  pvIncrement?: number; // Increment value for PV +/- buttons (default: 1)
  tempPV?: number; // PV temporário (separado do currentPV, consumido primeiro ao tomar dano)
  tempPM?: number; // PM temporário (separado do currentPM, consumido primeiro ao gastar PM)
  reducaoDeDano?: DamageReduction; // Redução de Dano total (calculado: auto + manual)
  bonusRd?: DamageReduction; // Bônus manual de RD por tipo (adicionado ao calculado)
  customProficiencias?: string[]; // Proficiências adicionadas manualmente pelo usuário
  removedProficiencias?: string[]; // Proficiências base removidas manualmente pelo usuário
  almaLivreClass?: string; // Classe escolhida pelo poder Alma Livre
  almaLivrePower?: ClassPower; // Poder pré-selecionado pelo poder Alma Livre
  diferentaoClass?: string; // Classe escolhida pelo poder Diferentão
  diferentaoPower?: ClassPower; // Poder escolhido pelo poder Diferentão
  poderesCapturados?: PoderCapturadoChoice[]; // Usurpador: Poder Capturado (4º nível)
  /**
   * @deprecated Substituído pelo `journal` (Diário do Jogador). Continua sendo
   * LIDO — é o fallback quando a feature está desligada e a fonte da migração —,
   * mas nada escreve nele. Mantido em disco de propósito: `migrateNotesToJournal`
   * copia o texto para um nó em vez de mover, então uma migração com defeito não
   * leva junto a anotação original do jogador.
   */
  notes?: string; // Anotações livres do jogador
  journal?: PlayerJournal; // Diário do Jogador (canvas de blocos)
  imageUrl?: string; // URL de imagem do personagem
  propositoCriacaoPower?: string; // Poder geral escolhido como Propósito de Criação (raças Golem)
  complication?: SheetComplication; // Complicação (Heróis de Arton) — cópia embutida + nome do poder concedido
  optionalRules?: SheetOptionalRules; // Demais regras opcionais de Heróis de Arton em uso nesta ficha
  age?: SheetAge; // Idades Variadas (Heróis de Arton) — faixa etária + complicações de idade
  overrideKeyAttribute?: Atributo; // Atributo-chave manual para CD de magias (quando classe não tem spellPath)
  tradicaoPerdidaPmAttribute?: Atributo; // Poder Tradição Perdida: atributo que entra no total de PM no lugar do atributo da classe (cap 6 +2/patamar). undefined = usa o atributo da classe.
  classLevels?: ClassLevelEntry[]; // Multiclasse: classe escolhida em cada nível (undefined = mono-classe)
  multiclassSpellPaths?: Record<string, SerializedSpellPath>; // Multiclasse: spellPath por className (serializable)
  companions?: CompanionSheet[]; // Melhor(es) Amigo(s) do Treinador
  animalCompanions?: SheetAnimalCompanion[]; // Companheiro(s) Animal(is) do Druida
  activeConditions?: ActiveCondition[]; // Condições (status effects) ativas na ficha
  activeEffects?: ActiveEffect[]; // Efeitos ativos (poderes com bônus temporário)
  /**
   * Efeitos customizados AVULSOS: criados direto no modal de Efeitos Ativos,
   * sem pertencer a nenhum poder/habilidade/magia. Existem só como definição —
   * ativá-los grava uma instância em `activeEffects`, como qualquer outro.
   *
   * Os efeitos customizados presos a um poder continuam morando no
   * `customEffects` do próprio poder.
   */
  customEffects?: CustomEffect[];
  /**
   * Overrides do jogador (perícia rolada, atributo de ataque/dano) sobre armas
   * VIRTUAIS — as que não estão na mochila e por isso não têm onde gravar a
   * edição. Hoje: as armas naturais da Forma Selvagem.
   *
   * Chaveado por `Equipment.overrideKey`, derivado do catálogo (forma + grau +
   * índice) e NÃO do `instanceId` do efeito ativo — é o que faz a escolha
   * sobreviver a reverter e voltar à forma. Ver `functions/weaponOverrides.ts`.
   */
  weaponOverrides?: Record<string, WeaponOverride>;
  /**
   * @deprecated Mantido por um ciclo de release apenas para deserializar
   * fichas antigas. Versões anteriores aplicavam penalidades de condições
   * mutando `atributos[attr].value` e rastreavam o delta neste ledger; isso
   * vazava efeitos temporários para o estado persistido. Hoje condições só
   * emitem `Skill` bonuses (ver `applyConditionBonuses`) e nunca tocam
   * `atributos`. O `recalculateSheet` reverte e descarta este campo
   * automaticamente quando encontrado. Remover em release subsequente.
   */
  conditionAttributePenalties?: Partial<Record<Atributo, number>>;
  /**
   * Ledger da perda de atributo por poderes da Tormenta ("ao escolher um poder
   * da Tormenta você perde 1 de Carisma, mais 1 para cada dois outros").
   *
   * Diferente de `conditionAttributePenalties`, esta perda é permanente e faz
   * parte da ficha — mutar `atributos` é o comportamento correto. O ledger
   * existe porque `recalculateSheet` NÃO rebaseia `atributos`: sem registrar
   * quanto já foi descontado (e de qual atributo, já que Linhagem Rubra drena
   * o maior atributo que não seja Carisma), cada recálculo empilharia a
   * penalidade de novo. Ver `functions/tormentaCharismaPenalty.ts`.
   */
  tormentaAttributePenalties?: Partial<Record<Atributo, number>>;
}

/**
 * Usurpador — Poder Capturado (4º nível): "Escolha um deus maior por nível e um
 * poder concedido desse deus".
 *
 * Guardado por NOME (não por objeto) porque o poder concedido é resolvido no
 * `dataRegistry` a cada render — assim correções no catálogo chegam a fichas
 * antigas. Este campo NÃO entra em nenhum motor de bônus: é insumo puro do
 * `ActiveEffect` que representa o poder atualmente roubado.
 */
export interface PoderCapturadoChoice {
  /** Nome do deus maior. */
  divindade: string;
  /** Nome do poder concedido escolhido desse deus. */
  poder: string;
  /** Nível em que a escolha foi feita (auditoria). */
  level: number;
}

/** SpellPath sem funções — para persistência. As funções são restauradas via restoreSpellPath. */
export interface SerializedSpellPath {
  initialSpells: number;
  spellType: 'Arcane' | 'Divine' | 'Both';
  schools?: SpellSchool[];
  excludeSchools?: SpellSchool[];
  includeDivineSchools?: SpellSchool[];
  includeArcaneSchools?: SpellSchool[];
  crossTraditionLimit?: number;
  crossTraditionRules?: CrossTraditionRules;
  keyAttribute: Atributo;
  spellAccess?: 'known' | 'allOfType';
  // Metadata para restaurar funções
  className: string;
  classSubname?: string;
}

export interface Step {
  label: string;
  type?: string;
  value: SubStep[];
  subSteps?: SubStep[];
}

export interface SubStep {
  name?: string;
  value: number | string;
}
