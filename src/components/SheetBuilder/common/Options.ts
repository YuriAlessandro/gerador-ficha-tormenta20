import {
  Attribute,
  GeneralPowerName,
  SkillName,
  Spells,
  Translator,
} from 't20-sheet-builder';
import { Option } from './Option';

export const skillsOptions = Object.values(SkillName)
  .sort((skillA, skillB) =>
    Translator.getSkillTranslation(skillA) <
    Translator.getSkillTranslation(skillB)
      ? -1
      : 1
  )
  .map((key) => ({
    value: key,
    label: Translator.getSkillTranslation(key),
  }));

export const generalPowerOptions = Object.values(GeneralPowerName).map(
  (key) => ({
    value: key,
    label: Translator.getPowerTranslation(key),
  })
);

export const spellsOptions = Spells.getAll()
  .sort((spellA, spellB) =>
    Translator.getSpellTranslation(spellA.spellName) <
    Translator.getSpellTranslation(spellB.spellName)
      ? -1
      : 1
  )
  .map((key) => ({
    value: key.spellName,
    label: Translator.getSpellTranslation(key.spellName),
  }));

const attributes: Attribute[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

export const attributesOptions: Option<Attribute>[] = attributes.map(
  (attribute) => ({
    label: Translator.getAttributeTranslation(attribute),
    value: attribute,
  })
);
