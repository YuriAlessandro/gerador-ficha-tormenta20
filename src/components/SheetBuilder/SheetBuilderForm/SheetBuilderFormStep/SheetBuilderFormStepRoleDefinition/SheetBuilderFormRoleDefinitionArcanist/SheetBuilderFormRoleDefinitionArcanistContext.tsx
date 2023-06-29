import React, { PropsWithChildren, useContext } from 'react';
import {
  ArcanisPathWizardFocusName,
  ArcanistLineageDraconicDamageType,
  ArcanistLineageType,
  ArcanistPathName,
  Attribute,
  GeneralPowerName,
  SkillName,
  SpellName,
} from 't20-sheet-builder';
import { useArcanistForm } from './useArcanistForm';

export type ArcanistFormContextType = {
  initialSpells: SpellName[];
  path?: ArcanistPathName;
  mageSpell?: SpellName;
  wizardFocus?: ArcanisPathWizardFocusName;
  sorcererLineage?: ArcanistLineageType;
  sorcererLineageDraconicDamageType?: ArcanistLineageDraconicDamageType;
  sorcererLineageFaerieExtraSpell?: SpellName;
  sorcererLineageRedExtraPower?: GeneralPowerName;
  sorcererLineageRedAttribute?: Attribute;
  skillsByGroup: SkillName[][];
  updateSkillGroup(skillGroup: SkillName[], groupIndex: number): void;
  selectPath(path: ArcanistPathName): void;
  selectSorcererLineage(lineage: ArcanistLineageType): void;
  setInitialSpells(spell: SpellName[]): void;
  setMageSpell(spell?: SpellName): void;
  setWizardFocus(focus?: ArcanisPathWizardFocusName): void;
  setSorcererLineage(lineage?: ArcanistLineageType): void;
  setSorcererLineageDraconicDamageType(
    damageType?: ArcanistLineageDraconicDamageType
  ): void;
  setSorcererLineageFaerieExtraSpell(spell?: SpellName): void;
  setSorcererLineageRedExtraPower(generalPower?: GeneralPowerName): void;
  setSorcererLineageRedAttribute(attribute?: Attribute): void;
};

const ArcanistFormContext = React.createContext(
  null as unknown as ArcanistFormContextType
);

export const ArcanistFormContextProvider: React.FC<
  PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const form = useArcanistForm();
  return (
    <ArcanistFormContext.Provider value={form}>
      {children}
    </ArcanistFormContext.Provider>
  );
};

export const useArcanistFormContext = () => {
  const context = useContext(ArcanistFormContext);

  if (!context) {
    throw new Error(
      'useArcanistContext must be used within an ArcanistContextProvider'
    );
  }

  return context;
};
