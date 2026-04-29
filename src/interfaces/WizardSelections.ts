import { Atributo } from '../data/systems/tormenta20/atributos';
import Skill from './Skills';
import { SelectionOptions, ManualPowerSelections } from './PowerSelections';
import { Spell, SpellSchool } from './Spells';
import { ClassPower } from './Class';
import { GeneralPower } from './Poderes';
import { OriginBenefits } from './Origin';
import { MarketSelections } from './MarketEquipment';
import { AttributeVariant } from './Race';
import { DamageType } from './CharacterSheet';
import {
  CompanionType,
  CompanionSize,
  CompanionTrick,
  NaturalWeaponDamageType,
  SpiritEnergyType,
} from './Companion';

export interface OriginBenefit {
  type: 'skill' | 'item' | 'power';
  name: string;
  alreadyUsed?: boolean; // Flag to indicate skill is already selected in previous steps
}

export interface LevelUpSelections {
  level: number;
  selectedClassName?: string; // Multiclasse: classe escolhida para este nível
  selectedClassSubname?: string; // Multiclasse: subtipo se aplicável
  // Escolha: poder de classe, poder geral OU poder de Alma Livre
  powerChoice: 'class' | 'general' | 'almaLivre';
  selectedClassPower?: ClassPower;
  selectedGeneralPower?: GeneralPower;
  selectedAlmaLivrePower?: ClassPower; // Poder pré-selecionado por Alma Livre
  // Seleções manuais para ações de poderes (keyed by power name)
  powerEffectSelections?: ManualPowerSelections;
  // Seleções para habilidades automáticas com pick actions (keyed by ability name)
  abilityEffectSelections?: ManualPowerSelections;
  // Magias aprendidas (se aplicável)
  spellsLearned?: Spell[];
  // Truque do parceiro (Treinador nos níveis 4, 7, 10, 13, 16, 19)
  companionTrick?: CompanionTrick;

  // Multiclasse: criação do Melhor Amigo ao pegar o 1º nível de Treinador
  companionName?: string;
  companionType?: CompanionType;
  companionSize?: CompanionSize;
  companionWeaponDamageType?: NaturalWeaponDamageType;
  companionSpiritEnergyType?: SpiritEnergyType;
  companionSkills?: Skill[];
  companionTricks?: CompanionTrick[];

  // Multiclasse: configuração de primeira vez na nova classe
  classSetup?: {
    arcanistaSubtype?: 'Bruxo' | 'Mago' | 'Feiticeiro';
    feiticeiroLinhagem?:
      | 'Linhagem Dracônica'
      | 'Linhagem Feérica'
      | 'Linhagem Rubra'
      | 'Linhagem Abençoada';
    draconicaDamageType?: string;
    linhagemAbencoadaDeus?: string;
    spellSchools?: SpellSchool[];
  };
}

export interface WizardSelections {
  // Basic character info
  characterName?: string;
  characterGender?: 'Masculino' | 'Feminino' | 'Outro';
  characterImageUrl?: string;

  // Base attribute values (before racial modifiers)
  baseAttributes?: Record<Atributo, number>;

  // Race attribute variant selection (for races with multiple attribute options like Kallyanach)
  attributeVariant?: AttributeVariant;

  // Race attribute choices for races with 'any' attributes
  raceAttributes?: Atributo[];

  // Base skill 'or' choices (e.g., Luta OR Pontaria for Guerreiro)
  // Each position corresponds to the Nth 'or' group in periciasbasicas
  baseSkillChoices?: Skill[];

  // Class skill selections from periciasrestantes
  classSkills?: Skill[];

  // Intelligence modifier skill selections
  intelligenceSkills?: Skill[];

  // Class power selections (if powers have "pick" actions)
  classPowerSelections?: SelectionOptions;

  // Origin benefit selections (for non-regional origins: 2 choices)
  originBenefits?: OriginBenefit[];

  // Cached origin benefits (computed once to prevent random re-selection on navigation)
  cachedOriginBenefits?: OriginBenefits;

  // Origin power selections (if origin powers need selection)
  originPowerSelections?: SelectionOptions;

  // Deity power selections (based on qtdPoderesConcedidos)
  deityPowers?: string[];

  // Power effect selections (for race/class/origin powers with "pick" actions)
  // Each power has its own SelectionOptions to support multiple powers needing the same type
  powerEffectSelections?: ManualPowerSelections;

  // Spell school selections (for classes like Bardo, Druida)
  spellSchools?: SpellSchool[];

  // Initial spell selections
  initialSpells?: Spell[];

  // Arcanista subtype selection (Bruxo/Mago/Feiticeiro)
  arcanistaSubtype?: 'Bruxo' | 'Mago' | 'Feiticeiro';

  // Feiticeiro linhagem selection
  feiticeiroLinhagem?:
    | 'Linhagem Dracônica'
    | 'Linhagem Feérica'
    | 'Linhagem Rubra'
    | 'Linhagem Abençoada';

  // Linhagem Abençoada: deus escolhido
  linhagemAbencoada?: {
    deus: string;
  };

  // Suraggel ability selection (replaces Luz Sagrada or Sombra Profana)
  suragelAbility?: string;

  // Qareen element selection (determines elemental resistance)
  qareenElement?: DamageType;

  // Moreau Coruja Sapiência: 1st-circle Divination spell name
  moreauSapienciaSpell?: string;

  // Osteon/Soterrado old race selection for Memória Póstuma
  osteonOldRace?: string;

  // Golem customization (if race is Golem Desperto)
  golemChassis?: string;
  golemEnergySource?: string;
  golemSize?: string;

  // Level up selections (for levels 2+)
  levelUpSelections?: LevelUpSelections[];

  // Propósito de Criação (for Golem races that don't have origins)
  propositoCriacaoPower?: GeneralPower;

  // Market step selections (equipment and money)
  marketSelections?: MarketSelections;

  // Seleções do parceiro (classe Treinador)
  companionName?: string;
  companionType?: CompanionType;
  companionSize?: CompanionSize;
  companionWeaponDamageType?: NaturalWeaponDamageType;
  companionSpiritEnergyType?: SpiritEnergyType;
  companionSkills?: Skill[];
  companionTricks?: CompanionTrick[];
}
