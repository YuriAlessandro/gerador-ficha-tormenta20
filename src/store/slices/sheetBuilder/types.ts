import { Attribute, Attributes, GeneralPowerName, OriginName, RaceName, RoleName, SerializedAcolyte, SerializedAnimalsFriend, SerializedArcanist, SerializedOriginBenefit, SkillName } from "t20-sheet-builder"

export interface SheetBuilderStateRaceHumanVersatileChoiceSkill {
  type: 'skill',
  name: SkillName
}

export interface SheetBuilderStateRaceHumanVersatileChoicePower {
  type: 'power',
  name: GeneralPowerName
}

export type SheetBuilderStateRaceHumanVersatileChoice = SheetBuilderStateRaceHumanVersatileChoiceSkill | SheetBuilderStateRaceHumanVersatileChoicePower

export interface SheetBuilderStateRaceHuman {
  name: RaceName.human,
  versatileChoices: SheetBuilderStateRaceHumanVersatileChoice[]
  selectedAttributes: Attribute[]
}

export interface SheetBuilderStateRaceDwarf {
  name: RaceName.dwarf
}

export type SheetBuilderStateRace<T = SheetBuilderStateRaceHuman | SheetBuilderStateRaceDwarf> = {
  attributeModifiers: Partial<Attributes>
} & T


export type SheetBuilderStateRole<T = SheetBuilderStateRoleWarrior | SerializedArcanist>  = {
  chosenSkills: SkillName[]
  name: RoleName
} & T

export type SheetBuilderStateRoleWarrior = {
  name: RoleName.warrior
}

export type SheetBuilderStateOrigin<T = SerializedAnimalsFriend | SerializedAcolyte> = {
  name: OriginName,
  chosenBenefits: SerializedOriginBenefit[]
} & T