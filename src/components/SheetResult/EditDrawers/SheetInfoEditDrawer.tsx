import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormGroup,
  FormControlLabel,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Divider,
  Autocomplete,
  Chip,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CharacterSheet, { Step, SubStep } from '@/interfaces/CharacterSheet';
import { dataRegistry } from '@/data/registry';
import Divindade from '@/interfaces/Divindade';
import DIVINDADES_DATA from '@/data/systems/tormenta20/divindades';
import { CharacterAttributes } from '@/interfaces/Character';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { modifyAttributesBasedOnRace } from '@/functions/general';
import { nomes, nameGenerators } from '@/data/systems/tormenta20/nomes';
import { useAuth } from '@/hooks/useAuth';
import { SupplementId } from '@/types/supplement.types';
import {
  MOREAU_HERITAGES,
  MoreauHeritageName,
  MOREAU_HERITAGE_NAMES,
} from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import {
  GOLEM_DESPERTO_CHASSIS,
  GOLEM_DESPERTO_CHASSIS_NAMES,
  GOLEM_DESPERTO_ENERGY_SOURCES,
  GOLEM_DESPERTO_SIZE_NAMES,
  GOLEM_DESPERTO_SIZES,
  getCompatibleEnergySources,
} from '@/data/systems/tormenta20/ameacas-de-arton/races/golem-desperto-config';
import { applyGolemDespertoCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { SURAGEL_ALTERNATIVE_ABILITIES } from '@/data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import Origin from '@/interfaces/Origin';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import {
  applyOriginBenefits,
  applyRegionalOriginBenefits,
  removeOriginBenefits,
} from '@/functions/originBenefits';
import { GeneralPower } from '@/interfaces/Poderes';
import OriginEditDrawer from './OriginEditDrawer';
import DeityPowerEditDrawer from './DeityPowerEditDrawer';

// Helper function to normalize deity names for comparison (removes hyphens and spaces)
const normalizeDeityName = (name: string): string =>
  name.toLowerCase().replace(/[-\s]/g, '');

interface SheetInfoEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
}

interface EditedData {
  nome: string;
  nivel: number;
  sexo: string;
  raceName: string;
  raceHeritage: string | undefined; // For races with heritages (like Moreau)
  raceChassis: string | undefined; // For Golem Desperto
  raceEnergySource: string | undefined; // For Golem Desperto
  raceSizeCategory: string | undefined; // For Golem Desperto
  suragelAbility: string | undefined; // For Suraggel (Aggelus/Sulfure) alternative abilities
  className: string;
  originName: string;
  deityName: string;
  attributes: CharacterAttributes;
  raceAttributeChoices: Atributo[]; // Manual choices for 'any' race attributes
  customPVPerLevel: number | undefined; // Custom PV per level
  customPMPerLevel: number | undefined; // Custom PM per level
  bonusPV: number; // Bonus PV
  bonusPM: number; // Bonus PM
  manualMaxPV: number | undefined; // Manual max PV override
  manualMaxPM: number | undefined; // Manual max PM override
}

// Helper function to get name suggestions based on race and gender
const getNameSuggestions = (
  raceName: string,
  gender: string,
  supplements: SupplementId[]
): string[] => {
  // Convert gender from display format to data format
  const genderKey = gender === 'Masculino' ? 'Homem' : 'Mulher';

  // Check if this race has specific names
  if (nomes[raceName] && nomes[raceName][genderKey]) {
    return nomes[raceName][genderKey];
  }

  // For special races like Lefou, Osteon, etc., try to get names from name generators
  const race = dataRegistry.getRaceByName(raceName, supplements);
  if (race && nameGenerators[raceName]) {
    // For complex name generators, return a sample of generated names
    const sampleNames: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      try {
        const name = nameGenerators[raceName](race, genderKey);
        if (name && !sampleNames.includes(name)) {
          sampleNames.push(name);
        }
      } catch (error) {
        // If name generation fails, break the loop
        break;
      }
    }
    return sampleNames;
  }

  // Default fallback to Humano names if no specific names found
  return nomes.Humano[genderKey] || [];
};
const SheetInfoEditDrawer: React.FC<SheetInfoEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const { user } = useAuth();
  const userSupplements = user?.enabledSupplements || [
    SupplementId.TORMENTA20_CORE,
  ];

  // Get races and classes based on user's enabled supplements (with supplement info for badges)
  const RACAS_WITH_INFO =
    dataRegistry.getRacesWithSupplementInfo(userSupplements);
  const CLASSES_WITH_INFO =
    dataRegistry.getClassesWithSupplementInfo(userSupplements);

  // Also keep simple arrays for backwards compatibility
  const RACAS = dataRegistry.getRacesBySupplements(userSupplements);
  const CLASSES = dataRegistry.getClassesBySupplements(userSupplements);
  const ORIGINS_WITH_INFO =
    dataRegistry.getOriginsBySupplements(userSupplements);

  const [editedData, setEditedData] = useState<EditedData>({
    nome: sheet.nome,
    nivel: sheet.nivel,
    sexo: sheet.sexo || 'Masculino',
    raceName: sheet.raca.name,
    raceHeritage: sheet.raceHeritage,
    raceChassis: sheet.raceChassis,
    raceEnergySource: sheet.raceEnergySource,
    raceSizeCategory: sheet.raceSizeCategory,
    suragelAbility: sheet.suragelAbility,
    className: sheet.classe.name,
    originName: sheet.origin?.name || '',
    deityName: sheet.devoto?.divindade.name || '',
    attributes: { ...sheet.atributos },
    raceAttributeChoices: sheet.raceAttributeChoices || [],
    customPVPerLevel: sheet.customPVPerLevel,
    customPMPerLevel: sheet.customPMPerLevel,
    bonusPV: sheet.bonusPV || 0,
    bonusPM: sheet.bonusPM || 0,
    manualMaxPV: sheet.manualMaxPV,
    manualMaxPM: sheet.manualMaxPM,
  });

  // State for name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>(() =>
    getNameSuggestions(
      sheet.raca.name,
      sheet.sexo || 'Masculino',
      userSupplements
    )
  );

  // State for controlling which accordions are expanded
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    'info-basicas',
  ]);

  // State for OriginEditDrawer
  const [originEditDrawerOpen, setOriginEditDrawerOpen] = useState(false);
  const [pendingOrigin, setPendingOrigin] = useState<Origin | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<CharacterSheet>>(
    {}
  );

  // State for DeityPowerEditDrawer
  const [deityEditDrawerOpen, setDeityEditDrawerOpen] = useState(false);
  const [pendingDeity, setPendingDeity] = useState<Divindade | null>(null);

  useEffect(() => {
    setEditedData({
      nome: sheet.nome,
      nivel: sheet.nivel,
      sexo: sheet.sexo || 'Masculino',
      raceName: sheet.raca.name,
      raceHeritage: sheet.raceHeritage,
      raceChassis: sheet.raceChassis,
      raceEnergySource: sheet.raceEnergySource,
      raceSizeCategory: sheet.raceSizeCategory,
      suragelAbility: sheet.suragelAbility,
      className: sheet.classe.name,
      originName: sheet.origin?.name || '',
      deityName: sheet.devoto?.divindade.name || '',
      attributes: { ...sheet.atributos },
      raceAttributeChoices: sheet.raceAttributeChoices || [],
      customPVPerLevel: sheet.customPVPerLevel,
      customPMPerLevel: sheet.customPMPerLevel,
      bonusPV: sheet.bonusPV || 0,
      bonusPM: sheet.bonusPM || 0,
      manualMaxPV: sheet.manualMaxPV,
      manualMaxPM: sheet.manualMaxPM,
    });
    setNameSuggestions(
      getNameSuggestions(
        sheet.raca.name,
        sheet.sexo || 'Masculino',
        userSupplements
      )
    );
  }, [sheet, open, userSupplements]);

  // Update name suggestions when race or gender changes
  useEffect(() => {
    setNameSuggestions(
      getNameSuggestions(editedData.raceName, editedData.sexo, userSupplements)
    );
  }, [editedData.raceName, editedData.sexo, userSupplements]);

  // Force female gender for female-only races
  useEffect(() => {
    if (editedData.raceName === 'Voracis' && editedData.sexo !== 'Feminino') {
      setEditedData((prev) => ({ ...prev, sexo: 'Feminino' }));
    }
  }, [editedData.raceName, editedData.sexo]);

  // Get info about the currently selected race's attribute requirements
  const selectedRace = RACAS.find((r) => r.name === editedData.raceName);

  // Get race attributes (considering sex-dependent races like Nagah, heritage-based races like Moreau, and Golem Desperto)
  const raceAttributes = (() => {
    // For Moreau, use heritage attributes if heritage is selected
    if (editedData.raceName === 'Moreau' && editedData.raceHeritage) {
      const heritage =
        MOREAU_HERITAGES[editedData.raceHeritage as MoreauHeritageName];
      if (heritage) {
        return heritage.attributes;
      }
    }

    // For Golem Desperto, accumulate base + chassis + size attributes
    if (
      editedData.raceName === 'Golem Desperto' &&
      editedData.raceChassis &&
      editedData.raceEnergySource &&
      editedData.raceSizeCategory
    ) {
      const baseRace = selectedRace;
      if (baseRace) {
        const customizedRace = applyGolemDespertoCustomization(
          baseRace,
          editedData.raceChassis,
          editedData.raceEnergySource,
          editedData.raceSizeCategory
        );
        return customizedRace.attributes.attrs;
      }
    }

    // For sex-dependent races (like Nagah)
    if (selectedRace?.getAttributes && editedData.sexo) {
      return selectedRace.getAttributes(
        editedData.sexo as 'Masculino' | 'Feminino'
      );
    }

    // Default: use race attributes
    return selectedRace?.attributes.attrs || [];
  })();

  const anyAttributeCount = raceAttributes.filter(
    (attr) => attr.attr === 'any'
  ).length;
  const fixedAttributes = raceAttributes.filter((attr) => attr.attr !== 'any');

  // Get list of attributes that can be selected (exclude fixed attributes)
  const fixedAttributeNames = fixedAttributes.map((attr) => attr.attr);
  const availableAttributes = Object.values(Atributo).filter(
    (attr) => !fixedAttributeNames.includes(attr)
  );

  // Reset race attribute choices when race, sex, or heritage changes
  useEffect(() => {
    setEditedData((prev) => ({
      ...prev,
      raceAttributeChoices: [],
    }));
  }, [
    editedData.raceName,
    editedData.sexo,
    editedData.raceHeritage,
    editedData.raceChassis,
    editedData.raceEnergySource,
    editedData.raceSizeCategory,
  ]);

  // Handler for race attribute selection
  const handleRaceAttributeSelection = (attribute: Atributo) => {
    setEditedData((prev) => {
      const currentChoices = prev.raceAttributeChoices;
      const isSelected = currentChoices.includes(attribute);

      let newChoices: Atributo[];
      if (isSelected) {
        // Deselect
        newChoices = currentChoices.filter((attr) => attr !== attribute);
      } else if (currentChoices.length < anyAttributeCount) {
        // Select (only if under limit)
        newChoices = [...currentChoices, attribute];
      } else {
        // Already at limit, don't add
        return prev;
      }

      return {
        ...prev,
        raceAttributeChoices: newChoices,
      };
    });
  };

  const recalculateSkills = (level: number) => {
    if (!sheet.completeSkills) return sheet.completeSkills;

    return sheet.completeSkills.map((skill) => ({
      ...skill,
      halfLevel: Math.floor(level / 2),
    }));
  };

  // Calculate bonus value from sheet bonuses (mirroring recalculateSheet logic)
  const calculateBonusValue = (
    bonus: {
      type: string;
      value?: number;
      attribute?: string;
      formula?: string;
    },
    nivel: number,
    atributos: CharacterAttributes,
    spellKeyAttribute?: Atributo
  ): number => {
    if (bonus.type === 'Level') {
      return nivel;
    }
    if (bonus.type === 'HalfLevel') {
      return Math.floor(nivel / 2);
    }
    if (bonus.type === 'Attribute') {
      const attr = bonus.attribute as Atributo;
      return atributos[attr]?.value || 0;
    }
    if (bonus.type === 'SpecialAttribute') {
      if (bonus.attribute === 'spellKeyAttr' && spellKeyAttribute) {
        return atributos[spellKeyAttribute].value;
      }
    }
    if (bonus.type === 'LevelCalc' && bonus.formula) {
      const formula = bonus.formula.replace(/{level}/g, nivel.toString());
      try {
        // eslint-disable-next-line no-eval
        return eval(formula);
      } catch {
        return 0;
      }
    }
    if (bonus.type === 'Fixed') {
      return bonus.value || 0;
    }
    return 0;
  };

  const recalculatePV = (
    level: number,
    className: string,
    attributes = sheet.atributos,
    customPVPerLevel?: number,
    bonusPV = 0
  ) => {
    const classData = CLASSES.find((c) => c.name === className);
    if (!classData) return sheet.pv;

    const conMod = attributes.Constituição.value;
    const pvBase = classData.pv + conMod;
    const pvPerLevel = (customPVPerLevel ?? classData.addpv ?? 0) + conMod;
    let total = pvBase + pvPerLevel * (level - 1) + bonusPV;

    // Add bonuses from powers/abilities
    const pvBonuses = sheet.sheetBonuses.filter(
      (bonus) => bonus.target.type === 'PV'
    );
    pvBonuses.forEach((bonus) => {
      const bonusValue = calculateBonusValue(
        bonus.modifier,
        level,
        attributes,
        classData.spellPath?.keyAttribute
      );
      total += bonusValue;
    });

    return total;
  };

  const recalculatePM = (
    level: number,
    className: string,
    attributes = sheet.atributos,
    customPMPerLevel?: number,
    bonusPM = 0
  ) => {
    const classData = CLASSES.find((c) => c.name === className);
    if (!classData) return sheet.pm;

    // Get the key attribute modifier for PM calculation
    let keyAttrMod = 0;
    if (classData.spellPath) {
      const keyAttr = attributes[classData.spellPath.keyAttribute];
      keyAttrMod = keyAttr ? keyAttr.value : 0;
    }

    const pmBase = classData.pm + keyAttrMod;
    const pmPerLevel = (customPMPerLevel ?? classData.addpm ?? 0) + keyAttrMod;
    let total = pmBase + pmPerLevel * (level - 1) + bonusPM;

    // Add bonuses from powers/abilities
    const pmBonuses = sheet.sheetBonuses.filter(
      (bonus) => bonus.target.type === 'PM'
    );
    pmBonuses.forEach((bonus) => {
      const bonusValue = calculateBonusValue(
        bonus.modifier,
        level,
        attributes,
        classData.spellPath?.keyAttribute
      );
      total += bonusValue;
    });

    return total;
  };

  const handleAttributeModifierChange = (
    atributo: Atributo,
    newValue: number
  ) => {
    // Clamp the value to reasonable bounds (-5 to 10)
    const clampedValue = Math.max(-5, Math.min(10, newValue));

    setEditedData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [atributo]: {
          ...prev.attributes[atributo],
          value: clampedValue,
        },
      },
    }));
  };

  const handleAccordionChange = (panel: string) => {
    setExpandedAccordions((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  const handleSave = () => {
    const updates: Partial<CharacterSheet> = {
      nome: editedData.nome,
      nivel: editedData.nivel,
      sexo: editedData.sexo,
      atributos: editedData.attributes,
      raceAttributeChoices: editedData.raceAttributeChoices,
      raceHeritage: editedData.raceHeritage,
      raceChassis: editedData.raceChassis,
      raceEnergySource: editedData.raceEnergySource,
      raceSizeCategory: editedData.raceSizeCategory,
      suragelAbility: editedData.suragelAbility,
      customPVPerLevel: editedData.customPVPerLevel,
      customPMPerLevel: editedData.customPMPerLevel,
      bonusPV: editedData.bonusPV,
      bonusPM: editedData.bonusPM,
      manualMaxPV: editedData.manualMaxPV,
      manualMaxPM: editedData.manualMaxPM,
    };

    // Track manual edits in steps
    const newSteps: Step[] = [];

    // Check for basic info changes
    const infoChanges: SubStep[] = [];
    if (editedData.nome !== sheet.nome) {
      infoChanges.push({ name: 'Nome', value: editedData.nome });
    }
    if (editedData.nivel !== sheet.nivel) {
      infoChanges.push({ name: 'Nível', value: editedData.nivel.toString() });
    }
    if (editedData.sexo !== sheet.sexo) {
      infoChanges.push({ name: 'Gênero', value: editedData.sexo });
    }

    if (infoChanges.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Informações Básicas',
        type: 'Edição Manual',
        value: infoChanges,
      });
    }

    // Check for attribute changes
    const attrChanges: SubStep[] = [];

    Object.entries(editedData.attributes).forEach(([attrName, attrData]) => {
      const originalAttr =
        sheet.atributos[attrName as keyof CharacterAttributes];
      if (attrData.value !== originalAttr.value) {
        attrChanges.push({
          name: attrName,
          value: attrData.value,
        });
      }
    });

    if (attrChanges.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Modificadores de Atributos',
        type: 'Atributos',
        value: attrChanges,
      });
    }

    // Check for race change
    if (editedData.raceName !== sheet.raca.name) {
      newSteps.push({
        label: 'Edição Manual - Raça',
        type: 'Edição Manual',
        value: [{ name: 'Raça', value: editedData.raceName }],
      });

      // Add race attribute choices if applicable
      if (
        editedData.raceAttributeChoices &&
        editedData.raceAttributeChoices.length > 0
      ) {
        newSteps.push({
          label: 'Edição Manual - Atributos da Raça',
          type: 'Atributos',
          value: editedData.raceAttributeChoices.map((attr) => ({
            name: attr,
            value: 1,
          })),
        });
      }
    }

    // Check for heritage change (for races like Moreau)
    if (
      editedData.raceHeritage !== sheet.raceHeritage &&
      editedData.raceName === 'Moreau'
    ) {
      const heritageName = editedData.raceHeritage
        ? MOREAU_HERITAGES[editedData.raceHeritage as MoreauHeritageName]?.name
        : 'Removida';

      newSteps.push({
        label: 'Edição Manual - Herança',
        type: 'Edição Manual',
        value: [{ name: 'Herança', value: heritageName }],
      });
    }

    // Check for Golem Desperto customization changes
    if (
      editedData.raceName === 'Golem Desperto' &&
      (editedData.raceChassis !== sheet.raceChassis ||
        editedData.raceEnergySource !== sheet.raceEnergySource ||
        editedData.raceSizeCategory !== sheet.raceSizeCategory)
    ) {
      const customizationChanges: SubStep[] = [];

      if (editedData.raceChassis !== sheet.raceChassis) {
        const chassisName = editedData.raceChassis
          ? GOLEM_DESPERTO_CHASSIS[editedData.raceChassis]?.name
          : 'Removido';
        customizationChanges.push({
          name: 'Chassi',
          value: chassisName,
        });
      }

      if (editedData.raceEnergySource !== sheet.raceEnergySource) {
        const energyName = editedData.raceEnergySource
          ? GOLEM_DESPERTO_ENERGY_SOURCES[editedData.raceEnergySource]
              ?.displayName
          : 'Removida';
        customizationChanges.push({
          name: 'Fonte de Energia',
          value: energyName,
        });
      }

      if (editedData.raceSizeCategory !== sheet.raceSizeCategory) {
        const sizeName = editedData.raceSizeCategory
          ? GOLEM_DESPERTO_SIZES[editedData.raceSizeCategory]?.displayName
          : 'Removido';
        customizationChanges.push({
          name: 'Tamanho',
          value: sizeName,
        });
      }

      if (customizationChanges.length > 0) {
        newSteps.push({
          label: 'Edição Manual - Customização do Golem Desperto',
          type: 'Edição Manual',
          value: customizationChanges,
        });
      }
    }

    // Check for Suraggel ability change
    if (
      editedData.raceName.startsWith('Suraggel') &&
      editedData.suragelAbility !== sheet.suragelAbility
    ) {
      const defaultAbilityName = editedData.raceName.includes('Aggelus')
        ? 'Luz Sagrada'
        : 'Sombras Profanas';
      const abilityName = editedData.suragelAbility || defaultAbilityName;

      newSteps.push({
        label: 'Edição Manual - Habilidade Racial Suraggel',
        type: 'Edição Manual',
        value: [{ name: 'Habilidade', value: abilityName }],
      });
    }

    // Check for sex change that affects attributes (for sex-dependent races like Nagah)
    if (
      editedData.sexo !== sheet.sexo &&
      selectedRace?.getAttributes &&
      editedData.raceName === sheet.raca.name
    ) {
      newSteps.push({
        label: 'Edição Manual - Gênero (Recalculando Atributos da Raça)',
        type: 'Edição Manual',
        value: [{ name: 'Gênero', value: editedData.sexo }],
      });
    }

    // Check for class change
    if (editedData.className !== sheet.classe.name) {
      newSteps.push({
        label: 'Edição Manual - Classe',
        type: 'Edição Manual',
        value: [{ name: 'Classe', value: editedData.className }],
      });
    }

    // Check for origin change
    if (editedData.originName !== (sheet.origin?.name || '')) {
      newSteps.push({
        label: 'Edição Manual - Origem',
        type: 'Edição Manual',
        value: [{ name: 'Origem', value: editedData.originName || 'Removida' }],
      });
    }

    // Check for deity change
    if (editedData.deityName !== (sheet.devoto?.divindade.name || '')) {
      newSteps.push({
        label: 'Edição Manual - Divindade',
        type: 'Edição Manual',
        value: [
          { name: 'Divindade', value: editedData.deityName || 'Removida' },
        ],
      });
    }

    // Add new steps to the sheet
    if (newSteps.length > 0) {
      updates.steps = [...sheet.steps, ...newSteps];
    }

    // Check if attributes have changed
    const attributesChanged =
      JSON.stringify(editedData.attributes) !== JSON.stringify(sheet.atributos);

    // Check if custom PV/PM values changed
    const customPVPMChanged =
      editedData.customPVPerLevel !== sheet.customPVPerLevel ||
      editedData.customPMPerLevel !== sheet.customPMPerLevel ||
      editedData.bonusPV !== sheet.bonusPV ||
      editedData.bonusPM !== sheet.bonusPM;

    // Track custom PV/PM changes in steps
    if (customPVPMChanged) {
      const pvpmChanges: SubStep[] = [];

      if (editedData.customPVPerLevel !== sheet.customPVPerLevel) {
        const defaultValue = sheet.classe.addpv;
        const newValue = editedData.customPVPerLevel ?? defaultValue;
        pvpmChanges.push({
          name: 'PV por Nível',
          value: `${newValue} (padrão: ${defaultValue})`,
        });
      }

      if (editedData.customPMPerLevel !== sheet.customPMPerLevel) {
        const defaultValue = sheet.classe.addpm;
        const newValue = editedData.customPMPerLevel ?? defaultValue;
        pvpmChanges.push({
          name: 'PM por Nível',
          value: `${newValue} (padrão: ${defaultValue})`,
        });
      }

      if (editedData.bonusPV !== (sheet.bonusPV || 0)) {
        pvpmChanges.push({
          name: 'Bônus de PV',
          value: editedData.bonusPV,
        });
      }

      if (editedData.bonusPM !== (sheet.bonusPM || 0)) {
        pvpmChanges.push({
          name: 'Bônus de PM',
          value: editedData.bonusPM,
        });
      }

      if (pvpmChanges.length > 0) {
        newSteps.push({
          label: 'Edição Manual - PV/PM Customizado',
          type: 'Edição Manual',
          value: pvpmChanges,
        });
      }
    }

    // Recalculate level-dependent values if level changed
    if (editedData.nivel !== sheet.nivel) {
      updates.completeSkills = recalculateSkills(editedData.nivel);
      updates.pv = recalculatePV(
        editedData.nivel,
        editedData.className,
        editedData.attributes,
        editedData.customPVPerLevel,
        editedData.bonusPV
      );
      updates.pm = recalculatePM(
        editedData.nivel,
        editedData.className,
        editedData.attributes,
        editedData.customPMPerLevel,
        editedData.bonusPM
      );
    }

    // Recalculate PV/PM if attributes or custom values changed (even if level didn't change)
    if (
      (attributesChanged || customPVPMChanged) &&
      editedData.nivel === sheet.nivel
    ) {
      updates.pv = recalculatePV(
        editedData.nivel,
        editedData.className,
        editedData.attributes,
        editedData.customPVPerLevel,
        editedData.bonusPV
      );
      updates.pm = recalculatePM(
        editedData.nivel,
        editedData.className,
        editedData.attributes,
        editedData.customPMPerLevel,
        editedData.bonusPM
      );
    }

    // Find and update race if changed OR sex changed (for sex-dependent races like Nagah) OR heritage changed (for Moreau) OR Golem Desperto customization changed OR Suraggel ability changed
    const raceOrSexOrHeritageOrGolemOrSuragelChanged =
      editedData.raceName !== sheet.raca.name ||
      (editedData.sexo !== sheet.sexo && selectedRace?.getAttributes) ||
      (editedData.raceName === 'Moreau' &&
        editedData.raceHeritage !== sheet.raceHeritage) ||
      (editedData.raceName === 'Golem Desperto' &&
        (editedData.raceChassis !== sheet.raceChassis ||
          editedData.raceEnergySource !== sheet.raceEnergySource ||
          editedData.raceSizeCategory !== sheet.raceSizeCategory)) ||
      (editedData.raceName.startsWith('Suraggel') &&
        editedData.suragelAbility !== sheet.suragelAbility);

    if (raceOrSexOrHeritageOrGolemOrSuragelChanged) {
      let newRace = RACAS.find((r) => r.name === editedData.raceName);
      if (newRace) {
        // For Moreau, update race with heritage attributes and abilities
        if (editedData.raceName === 'Moreau' && editedData.raceHeritage) {
          const heritage =
            MOREAU_HERITAGES[editedData.raceHeritage as MoreauHeritageName];
          if (heritage) {
            newRace = {
              ...newRace,
              heritage: editedData.raceHeritage,
              attributes: {
                attrs: heritage.attributes,
              },
              abilities: heritage.abilities,
            };
          }
        }

        // For Golem Desperto, apply customization
        if (
          editedData.raceName === 'Golem Desperto' &&
          editedData.raceChassis &&
          editedData.raceEnergySource &&
          editedData.raceSizeCategory
        ) {
          newRace = applyGolemDespertoCustomization(
            newRace,
            editedData.raceChassis,
            editedData.raceEnergySource,
            editedData.raceSizeCategory
          );

          // Update displacement and size based on customization
          if (newRace.getDisplacement) {
            updates.displacement = newRace.getDisplacement(newRace);
          }
          if (newRace.size) {
            updates.size = newRace.size;
          }
        }

        // For Suraggel races, apply alternative ability if selected
        if (editedData.raceName.startsWith('Suraggel')) {
          const defaultAbilityName = editedData.raceName.includes('Aggelus')
            ? 'Luz Sagrada'
            : 'Sombras Profanas';

          if (editedData.suragelAbility) {
            // User selected an alternative ability - replace the default one
            const alternativeAbility = SURAGEL_ALTERNATIVE_ABILITIES.find(
              (a) => a.name === editedData.suragelAbility
            );
            if (alternativeAbility) {
              const abilityIndex = newRace.abilities.findIndex(
                (a) => a.name === defaultAbilityName
              );
              if (abilityIndex !== -1) {
                newRace = {
                  ...newRace,
                  abilities: [
                    ...newRace.abilities.slice(0, abilityIndex),
                    {
                      name: alternativeAbility.name,
                      description: alternativeAbility.description,
                      sheetBonuses: alternativeAbility.sheetBonuses,
                      sheetActions: alternativeAbility.sheetActions,
                    },
                    ...newRace.abilities.slice(abilityIndex + 1),
                  ],
                };
              }
            }
          }
        }

        updates.raca = newRace;

        // Recalculate attributes based on the new race
        // First, we need to remove old race modifiers and apply new ones
        // We'll do this by reverting to base attributes and reapplying race modifiers

        // Get base attributes (current attributes minus old race bonuses)
        const oldRace = sheet.raca;
        const baseAttributes = { ...editedData.attributes };

        // Get old race attributes (considering sex-dependent races)
        const oldRaceAttributes =
          oldRace.getAttributes && sheet.sexo
            ? oldRace.getAttributes(sheet.sexo as 'Masculino' | 'Feminino')
            : oldRace.attributes.attrs;

        // Remove old race attribute modifiers
        oldRaceAttributes.forEach((attrMod) => {
          if (attrMod.attr !== 'any') {
            // Fixed attribute modifier - remove it
            const currentAttr = baseAttributes[attrMod.attr];
            const newValue = currentAttr.value - attrMod.mod;
            baseAttributes[attrMod.attr] = {
              ...currentAttr,
              value: newValue,
            };
          }
        });

        // If there were 'any' attributes in old race, we need to remove those too
        // We stored them in raceAttributeChoices, so we can reverse them
        if (
          sheet.raceAttributeChoices &&
          sheet.raceAttributeChoices.length > 0
        ) {
          sheet.raceAttributeChoices.forEach((attr) => {
            const currentAttr = baseAttributes[attr];
            const newValue = currentAttr.value - 1; // 'any' attributes always give +1
            baseAttributes[attr] = {
              ...currentAttr,
              value: newValue,
            };
          });
        }

        // Now apply new race modifiers using the manual choices if provided
        const tempSteps: Step[] = [];
        const modifiedAttributes = modifyAttributesBasedOnRace(
          newRace,
          baseAttributes,
          sheet.classe.attrPriority || [],
          tempSteps,
          editedData.raceAttributeChoices.length > 0
            ? editedData.raceAttributeChoices
            : undefined,
          editedData.sexo as 'Masculino' | 'Feminino'
        );

        updates.atributos = modifiedAttributes;
      }
    }

    // Find and update class if changed
    if (editedData.className !== sheet.classe.name) {
      const newClass = CLASSES.find((c) => c.name === editedData.className);
      if (newClass) {
        updates.classe = newClass;
        // Recalculate PV and PM for the new class
        updates.pv = recalculatePV(
          editedData.nivel,
          editedData.className,
          editedData.attributes,
          editedData.customPVPerLevel,
          editedData.bonusPV
        );
        updates.pm = recalculatePM(
          editedData.nivel,
          editedData.className,
          editedData.attributes,
          editedData.customPMPerLevel,
          editedData.bonusPM
        );
      }
    }

    // Find and update origin if changed
    if (editedData.originName && editedData.originName !== sheet.origin?.name) {
      const newOrigin = ORIGINS_WITH_INFO.find(
        (o) => o.name === editedData.originName
      );
      if (newOrigin) {
        // Regional origins: auto-grant all benefits
        if (newOrigin.isRegional) {
          // Remove old origin benefits first
          let updatedSheet = removeOriginBenefits(sheet);
          // Apply new regional origin benefits
          updatedSheet = applyRegionalOriginBenefits(
            { ...updatedSheet, ...updates },
            newOrigin
          );
          updates.origin = updatedSheet.origin;
          updates.skills = updatedSheet.skills;
        } else {
          // Regular origins: need user to select benefits
          // Check if deity also changed and store it for later
          let deityToStore: Divindade | null = null;
          if (
            editedData.deityName &&
            editedData.deityName !== sheet.devoto?.divindade.name
          ) {
            const normalizedSearch = normalizeDeityName(editedData.deityName);
            const foundDeity = DIVINDADES_DATA.find(
              (d) => normalizeDeityName(d.name) === normalizedSearch
            );
            if (foundDeity) {
              deityToStore = foundDeity;
            }
          }

          // Store pending updates and open drawer
          setPendingUpdates(updates);
          setPendingOrigin(newOrigin);
          if (deityToStore) {
            setPendingDeity(deityToStore);
          }
          setOriginEditDrawerOpen(true);
          return; // Don't save yet, wait for benefit selection
        }
      }
    } else if (!editedData.originName && sheet.origin) {
      // Remove origin
      const updatedSheet = removeOriginBenefits(sheet);
      updates.origin = updatedSheet.origin;
      updates.skills = updatedSheet.skills;
    }

    // Find and update deity if changed
    if (
      editedData.deityName &&
      editedData.deityName !== sheet.devoto?.divindade.name
    ) {
      const normalizedSearch = normalizeDeityName(editedData.deityName);
      const newDeity = DIVINDADES_DATA.find(
        (d) => normalizeDeityName(d.name) === normalizedSearch
      );
      if (newDeity) {
        // Check if class gets all powers automatically
        const getsAllPowers = sheet.classe.qtdPoderesConcedidos === 'all';

        if (getsAllPowers) {
          // Classes like Clérigo, Paladino, Frade get all powers automatically
          updates.devoto = {
            divindade: newDeity,
            poderes: newDeity.poderes,
          };
        } else {
          // Other classes need to select powers - open drawer
          setPendingUpdates(updates);
          setPendingDeity(newDeity);
          setDeityEditDrawerOpen(true);
          return; // Don't save yet, wait for power selection
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Divindade não encontrada (edit):', {
          searchName: editedData.deityName,
          normalized: normalizedSearch,
          availableDeities: DIVINDADES_DATA.map((d) => ({
            name: d.name,
            normalized: normalizeDeityName(d.name),
          })),
        });
      }
    } else if (!editedData.deityName && sheet.devoto) {
      updates.devoto = undefined;
    }

    // Use recalculation for full sheet update if attributes, race, or deity changed
    const raceChanged = editedData.raceName !== sheet.raca.name;
    const deityChanged =
      editedData.deityName !== (sheet.devoto?.divindade.name || '');
    const shouldUseRecalculateSheet =
      attributesChanged || raceChanged || deityChanged;

    if (shouldUseRecalculateSheet) {
      const updatedSheet = { ...sheet, ...updates };
      const recalculatedSheet = recalculateSheet(updatedSheet);
      onSave(recalculatedSheet);
    } else {
      onSave(updates);
    }

    onClose();
  };

  const handleCancel = () => {
    setEditedData({
      nome: sheet.nome,
      nivel: sheet.nivel,
      sexo: sheet.sexo || 'Masculino',
      raceName: sheet.raca.name,
      raceHeritage: sheet.raceHeritage,
      raceChassis: sheet.raceChassis,
      raceEnergySource: sheet.raceEnergySource,
      raceSizeCategory: sheet.raceSizeCategory,
      suragelAbility: sheet.suragelAbility,
      className: sheet.classe.name,
      originName: sheet.origin?.name || '',
      deityName: sheet.devoto?.divindade.name || '',
      attributes: { ...sheet.atributos },
      raceAttributeChoices: sheet.raceAttributeChoices || [],
      customPVPerLevel: sheet.customPVPerLevel,
      customPMPerLevel: sheet.customPMPerLevel,
      bonusPV: sheet.bonusPV || 0,
      bonusPM: sheet.bonusPM || 0,
      manualMaxPV: sheet.manualMaxPV,
      manualMaxPM: sheet.manualMaxPM,
    });
    setNameSuggestions(
      getNameSuggestions(
        sheet.raca.name,
        sheet.sexo || 'Masculino',
        userSupplements
      )
    );
    onClose();
  };

  // Handle origin benefit selection
  const handleOriginBenefitsSave = (selectedBenefits: OriginBenefit[]) => {
    if (!pendingOrigin) return;

    // Remove old origin benefits first
    let updatedSheet = removeOriginBenefits(sheet);

    // Apply new origin with selected benefits
    updatedSheet = applyOriginBenefits(
      { ...updatedSheet, ...pendingUpdates },
      pendingOrigin,
      selectedBenefits
    );

    // Merge origin-related updates
    const originUpdates = {
      ...pendingUpdates,
      origin: updatedSheet.origin,
      skills: updatedSheet.skills,
    };

    // Check if there's also a pending deity change
    if (pendingDeity) {
      const getsAllPowers = sheet.classe.qtdPoderesConcedidos === 'all';

      if (getsAllPowers) {
        // Classes like Clérigo, Paladino, Frade get all powers automatically
        originUpdates.devoto = {
          divindade: pendingDeity,
          poderes: pendingDeity.poderes,
        };
        // Save everything and clean up
        const updatedSheetFinal = { ...sheet, ...originUpdates };
        const recalculatedSheet = recalculateSheet(updatedSheetFinal);
        onSave(recalculatedSheet);
        setPendingOrigin(null);
        setPendingDeity(null);
        setPendingUpdates({});
        setOriginEditDrawerOpen(false);
        onClose();
      } else {
        // Need to open deity drawer for power selection
        setPendingUpdates(originUpdates);
        setPendingOrigin(null);
        setOriginEditDrawerOpen(false);
        setDeityEditDrawerOpen(true);
        // Don't close yet - deity drawer will handle final save
      }
      return;
    }

    // No pending deity - save normally
    const updatedSheetFinal = { ...sheet, ...originUpdates };
    const recalculatedSheet = recalculateSheet(updatedSheetFinal);
    onSave(recalculatedSheet);

    // Clean up
    setPendingOrigin(null);
    setPendingUpdates({});
    setOriginEditDrawerOpen(false);
    onClose();
  };

  // Handle deity power selection
  const handleDeityPowersSave = (selectedPowers: GeneralPower[]) => {
    if (!pendingDeity) return;

    // Update devoto with selected powers
    const finalUpdates = {
      ...pendingUpdates,
      devoto: {
        divindade: pendingDeity,
        poderes: selectedPowers,
      },
    };

    // Use recalculation for full sheet update
    const updatedSheet = { ...sheet, ...finalUpdates };
    const recalculatedSheet = recalculateSheet(updatedSheet);
    onSave(recalculatedSheet);

    // Clean up
    setPendingDeity(null);
    setPendingUpdates({});
    setDeityEditDrawerOpen(false);
    onClose();
  };

  // Calculate PV preview based on current edits
  const calculatePVPreview = () =>
    recalculatePV(
      editedData.nivel,
      editedData.className,
      editedData.attributes,
      editedData.customPVPerLevel,
      editedData.bonusPV
    );

  // Calculate PM preview based on current edits
  const calculatePMPreview = () =>
    recalculatePM(
      editedData.nivel,
      editedData.className,
      editedData.attributes,
      editedData.customPMPerLevel,
      editedData.bonusPM
    );

  // Generate PV calculation formula string
  const getPVCalculationFormula = () => {
    const classData = CLASSES.find((c) => c.name === editedData.className);
    if (!classData) return '';

    const conMod = editedData.attributes.Constituição.value;
    const pvPerLevel = editedData.customPVPerLevel ?? classData.addpv ?? 0;
    const pvBase = classData.pv + conMod;
    const pvFromLevels = (pvPerLevel + conMod) * (editedData.nivel - 1);
    const bonus = editedData.bonusPV;

    // Calculate power bonuses
    const pvBonuses = sheet.sheetBonuses.filter((b) => b.target.type === 'PV');
    const powerBonusDetails = pvBonuses.map((b) => {
      const value = calculateBonusValue(
        b.modifier,
        editedData.nivel,
        editedData.attributes,
        classData.spellPath?.keyAttribute
      );
      let sourceName = 'Desconhecido';
      if (b.source?.type === 'power') {
        sourceName = b.source.name;
      } else if (b.source?.type === 'origin') {
        sourceName = b.source.originName || 'Origem';
      } else if (b.source?.type === 'race') {
        sourceName = b.source.raceName || 'Raça';
      }
      return { value, source: sourceName };
    });
    const totalPowerBonuses = powerBonusDetails.reduce(
      (sum, b) => sum + b.value,
      0
    );

    let formula = `${classData.pv} (base) + ${conMod} (CON)`;
    if (editedData.nivel > 1) {
      formula += ` + [${pvPerLevel} (por nível) + ${conMod} (CON)] × ${
        editedData.nivel - 1
      }`;
    }
    // Add power bonuses to formula
    powerBonusDetails.forEach((b) => {
      if (b.value !== 0) {
        formula += ` + ${b.value} (${b.source})`;
      }
    });
    if (bonus !== 0) {
      formula += ` + ${bonus} (bônus manual)`;
    }
    formula += ` = ${pvBase}`;
    if (editedData.nivel > 1) {
      formula += ` + ${pvFromLevels}`;
    }
    if (totalPowerBonuses !== 0) {
      formula += ` + ${totalPowerBonuses}`;
    }
    if (bonus !== 0) {
      formula += ` + ${bonus}`;
    }
    formula += ` = ${calculatePVPreview()}`;

    return formula;
  };

  // Generate PM calculation formula string
  const getPMCalculationFormula = () => {
    const classData = CLASSES.find((c) => c.name === editedData.className);
    if (!classData) return '';

    let keyAttrMod = 0;
    let keyAttrName = '';
    if (classData.spellPath) {
      const keyAttr = editedData.attributes[classData.spellPath.keyAttribute];
      keyAttrMod = keyAttr ? keyAttr.value : 0;
      keyAttrName = classData.spellPath.keyAttribute.substring(0, 3);
    }

    const pmPerLevel = editedData.customPMPerLevel ?? classData.addpm ?? 0;
    const pmBase = classData.pm + keyAttrMod;
    const pmFromLevels = (pmPerLevel + keyAttrMod) * (editedData.nivel - 1);
    const bonus = editedData.bonusPM;

    // Calculate power bonuses
    const pmBonuses = sheet.sheetBonuses.filter((b) => b.target.type === 'PM');
    const powerBonusDetails = pmBonuses.map((b) => {
      const value = calculateBonusValue(
        b.modifier,
        editedData.nivel,
        editedData.attributes,
        classData.spellPath?.keyAttribute
      );
      let sourceName = 'Desconhecido';
      if (b.source?.type === 'power') {
        sourceName = b.source.name;
      } else if (b.source?.type === 'origin') {
        sourceName = b.source.originName || 'Origem';
      } else if (b.source?.type === 'race') {
        sourceName = b.source.raceName || 'Raça';
      }
      return { value, source: sourceName };
    });
    const totalPowerBonuses = powerBonusDetails.reduce(
      (sum, b) => sum + b.value,
      0
    );

    let formula = `${classData.pm} (base)`;
    if (keyAttrMod !== 0) {
      formula += ` + ${keyAttrMod} (${keyAttrName})`;
    }
    if (editedData.nivel > 1) {
      formula += ` + [${pmPerLevel} (por nível)`;
      if (keyAttrMod !== 0) {
        formula += ` + ${keyAttrMod} (${keyAttrName})`;
      }
      formula += `] × ${editedData.nivel - 1}`;
    }
    // Add power bonuses to formula
    powerBonusDetails.forEach((b) => {
      if (b.value !== 0) {
        formula += ` + ${b.value} (${b.source})`;
      }
    });
    if (bonus !== 0) {
      formula += ` + ${bonus} (bônus manual)`;
    }
    formula += ` = ${pmBase}`;
    if (editedData.nivel > 1) {
      formula += ` + ${pmFromLevels}`;
    }
    if (totalPowerBonuses !== 0) {
      formula += ` + ${totalPowerBonuses}`;
    }
    if (bonus !== 0) {
      formula += ` + ${bonus}`;
    }
    formula += ` = ${calculatePMPreview()}`;

    return formula;
  };

  return (
    <>
      <Drawer
        anchor='right'
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 450 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h6'>Editar Informações da Ficha</Typography>
            <IconButton onClick={handleCancel} size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            {/* Accordion 1: Informações Básicas */}
            <Accordion
              expanded={expandedAccordions.includes('info-basicas')}
              onChange={() => handleAccordionChange('info-basicas')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='medium'>
                  Informações Básicas
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Autocomplete
                    freeSolo
                    options={nameSuggestions}
                    value={editedData.nome}
                    onChange={(event, newValue) => {
                      setEditedData({ ...editedData, nome: newValue || '' });
                    }}
                    onInputChange={(event, newInputValue) => {
                      setEditedData({ ...editedData, nome: newInputValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...params}
                        fullWidth
                        label='Nome'
                        helperText='Digite ou selecione um nome baseado na raça e gênero'
                      />
                    )}
                  />

                  <TextField
                    fullWidth
                    label='Nível'
                    type='number'
                    value={editedData.nivel}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        nivel: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    inputProps={{ min: 1, max: 20 }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Gênero</InputLabel>
                    <Select
                      value={editedData.sexo}
                      label='Gênero'
                      onChange={(e) =>
                        setEditedData({ ...editedData, sexo: e.target.value })
                      }
                      disabled={editedData.raceName === 'Voracis'}
                    >
                      <MenuItem value='Masculino'>Masculino</MenuItem>
                      <MenuItem value='Feminino'>Feminino</MenuItem>
                      <MenuItem value='Outro'>Outro</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Raça</InputLabel>
                    <Select
                      value={editedData.raceName}
                      label='Raça'
                      onChange={(e) => {
                        const newRaceName = e.target.value as string;
                        setEditedData({
                          ...editedData,
                          raceName: newRaceName,
                          // Reset heritage if changing from a race with heritage
                          raceHeritage:
                            newRaceName === 'Moreau'
                              ? editedData.raceHeritage
                              : undefined,
                          // Reset Golem Desperto customizations if changing from/to Golem Desperto
                          raceChassis:
                            newRaceName === 'Golem Desperto'
                              ? editedData.raceChassis
                              : undefined,
                          raceEnergySource:
                            newRaceName === 'Golem Desperto'
                              ? editedData.raceEnergySource
                              : undefined,
                          raceSizeCategory:
                            newRaceName === 'Golem Desperto'
                              ? editedData.raceSizeCategory
                              : undefined,
                          // Reset Suraggel ability if changing from/to Suraggel race
                          suragelAbility: newRaceName.startsWith('Suraggel')
                            ? editedData.suragelAbility
                            : undefined,
                        });
                      }}
                    >
                      {RACAS_WITH_INFO.map((race) => (
                        <MenuItem key={race.name} value={race.name}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              width: '100%',
                            }}
                          >
                            <span>{race.name}</span>
                            {race.supplementId !==
                              SupplementId.TORMENTA20_CORE && (
                              <Chip
                                label={race.supplementName}
                                size='small'
                                sx={{
                                  height: '20px',
                                  fontSize: '0.7rem',
                                  ml: 'auto',
                                }}
                                color='primary'
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Heritage Selector - Only show for races with heritages (like Moreau) */}
                  {editedData.raceName === 'Moreau' && (
                    <FormControl fullWidth>
                      <InputLabel>Herança</InputLabel>
                      <Select
                        value={editedData.raceHeritage || ''}
                        label='Herança'
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            raceHeritage: e.target.value as string,
                          })
                        }
                      >
                        {MOREAU_HERITAGE_NAMES.map((heritageName) => (
                          <MenuItem key={heritageName} value={heritageName}>
                            {MOREAU_HERITAGES[heritageName].name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Golem Desperto Customizations - Only show for Golem Desperto */}
                  {editedData.raceName === 'Golem Desperto' && (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>Chassi</InputLabel>
                        <Select
                          value={editedData.raceChassis || 'ferro'}
                          label='Chassi'
                          onChange={(e) => {
                            const newChassis = e.target.value as string;
                            const compatibleEnergies =
                              getCompatibleEnergySources(newChassis);

                            // If current energy source is incompatible, reset to first compatible one
                            const newEnergySource = compatibleEnergies.includes(
                              editedData.raceEnergySource || ''
                            )
                              ? editedData.raceEnergySource
                              : compatibleEnergies[0];

                            setEditedData({
                              ...editedData,
                              raceChassis: newChassis,
                              raceEnergySource: newEnergySource,
                            });
                          }}
                        >
                          {GOLEM_DESPERTO_CHASSIS_NAMES.map((chassisId) => (
                            <MenuItem key={chassisId} value={chassisId}>
                              {GOLEM_DESPERTO_CHASSIS[chassisId].name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Fonte de Energia</InputLabel>
                        <Select
                          value={editedData.raceEnergySource || 'alquimica'}
                          label='Fonte de Energia'
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              raceEnergySource: e.target.value as string,
                            })
                          }
                        >
                          {getCompatibleEnergySources(
                            editedData.raceChassis || 'ferro'
                          ).map((energyId) => (
                            <MenuItem key={energyId} value={energyId}>
                              {
                                GOLEM_DESPERTO_ENERGY_SOURCES[energyId]
                                  .displayName
                              }
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Tamanho</InputLabel>
                        <Select
                          value={editedData.raceSizeCategory || 'medio'}
                          label='Tamanho'
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              raceSizeCategory: e.target.value as string,
                            })
                          }
                        >
                          {GOLEM_DESPERTO_SIZE_NAMES.map((sizeId) => (
                            <MenuItem key={sizeId} value={sizeId}>
                              {GOLEM_DESPERTO_SIZES[sizeId].displayName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {/* Suraggel Ability Selector - Only show for Suraggel races with Deuses de Arton supplement */}
                  {editedData.raceName.startsWith('Suraggel') &&
                    userSupplements.includes(
                      SupplementId.TORMENTA20_DEUSES_ARTON
                    ) && (
                      <FormControl fullWidth>
                        <InputLabel>Habilidade Racial</InputLabel>
                        <Select
                          value={editedData.suragelAbility || ''}
                          label='Habilidade Racial'
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              suragelAbility: e.target.value || undefined,
                            })
                          }
                        >
                          <MenuItem value=''>
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'
                            >
                              <span>
                                {editedData.raceName.includes('Aggelus')
                                  ? 'Luz Sagrada'
                                  : 'Sombras Profanas'}
                              </span>
                              <Chip
                                label='Padrão'
                                size='small'
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            </Stack>
                          </MenuItem>
                          {SURAGEL_ALTERNATIVE_ABILITIES.map((ability) => (
                            <MenuItem key={ability.name} value={ability.name}>
                              <Stack
                                direction='row'
                                spacing={1}
                                alignItems='center'
                                justifyContent='space-between'
                                width='100%'
                              >
                                <span>{ability.name}</span>
                                <Stack direction='row' spacing={0.5}>
                                  <Chip
                                    label={ability.plano}
                                    size='small'
                                    color='secondary'
                                    sx={{ fontSize: '0.65rem', height: '18px' }}
                                  />
                                  <Chip
                                    label='Deuses de Arton'
                                    size='small'
                                    color='primary'
                                    sx={{ fontSize: '0.65rem', height: '18px' }}
                                  />
                                </Stack>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                  {/* Race Fixed Attributes - Always show if race has fixed attributes */}
                  {fixedAttributes.length > 0 && anyAttributeCount === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.default',
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>
                        Modificadores de Atributos da Raça
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'text.secondary' }}
                      >
                        {fixedAttributes.map((attr, idx) => (
                          <span key={`${attr.attr}-${attr.mod}`}>
                            {attr.attr} {attr.mod >= 0 ? '+' : ''}
                            {attr.mod}
                            {idx < fixedAttributes.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </Typography>
                    </Box>
                  )}

                  {/* Race Attribute Selection - Show if race has 'any' attributes */}
                  {anyAttributeCount > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>
                        Atributos da Raça
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ mb: 2, color: 'text.secondary' }}
                      >
                        {fixedAttributes.length > 0 && (
                          <>
                            Fixo:{' '}
                            {fixedAttributes.map((attr, idx) => (
                              <span key={`${attr.attr}-${attr.mod}`}>
                                {attr.attr} {attr.mod >= 0 ? '+' : ''}
                                {attr.mod}
                                {idx < fixedAttributes.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                            <br />
                          </>
                        )}
                        Escolha {anyAttributeCount} atributo
                        {anyAttributeCount > 1 ? 's' : ''}
                        {fixedAttributes.length > 0 ? ' diferente' : ''}
                        {anyAttributeCount > 1 && fixedAttributes.length > 0
                          ? 's'
                          : ''}{' '}
                        para receber +1:
                      </Typography>
                      <FormGroup>
                        <Stack direction='row' flexWrap='wrap' gap={1}>
                          {availableAttributes.map((atributo) => {
                            const isSelected =
                              editedData.raceAttributeChoices.includes(
                                atributo
                              );
                            const isDisabled =
                              !isSelected &&
                              editedData.raceAttributeChoices.length >=
                                anyAttributeCount;
                            return (
                              <FormControlLabel
                                key={atributo}
                                control={
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() =>
                                      handleRaceAttributeSelection(atributo)
                                    }
                                    disabled={isDisabled}
                                  />
                                }
                                label={atributo}
                              />
                            );
                          })}
                        </Stack>
                      </FormGroup>
                      {editedData.raceAttributeChoices.length <
                        anyAttributeCount && (
                        <Typography
                          variant='caption'
                          sx={{
                            mt: 1,
                            display: 'block',
                            color: 'warning.main',
                          }}
                        >
                          Selecione{' '}
                          {anyAttributeCount -
                            editedData.raceAttributeChoices.length}{' '}
                          atributo
                          {anyAttributeCount -
                            editedData.raceAttributeChoices.length >
                          1
                            ? 's'
                            : ''}{' '}
                          ainda
                        </Typography>
                      )}
                    </Box>
                  )}

                  <FormControl fullWidth>
                    <InputLabel>Classe</InputLabel>
                    <Select
                      value={editedData.className}
                      label='Classe'
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          className: e.target.value,
                        })
                      }
                    >
                      {CLASSES_WITH_INFO.map((cls) => (
                        <MenuItem key={cls.name} value={cls.name}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              width: '100%',
                            }}
                          >
                            <span>{cls.name}</span>
                            {cls.supplementId !==
                              SupplementId.TORMENTA20_CORE && (
                              <Chip
                                label={cls.supplementName}
                                size='small'
                                sx={{
                                  height: '20px',
                                  fontSize: '0.7rem',
                                  ml: 'auto',
                                }}
                                color='primary'
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Origem</InputLabel>
                    <Select
                      value={editedData.originName}
                      label='Origem'
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          originName: e.target.value,
                        })
                      }
                    >
                      <MenuItem value=''>Nenhuma</MenuItem>
                      {ORIGINS_WITH_INFO.map((origin) => (
                        <MenuItem key={origin.name} value={origin.name}>
                          <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            justifyContent='space-between'
                            width='100%'
                          >
                            <span>{origin.name}</span>
                            {origin.supplementId !==
                              SupplementId.TORMENTA20_CORE && (
                              <Chip
                                label={origin.supplementName}
                                size='small'
                                color='secondary'
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Divindade</InputLabel>
                    <Select
                      value={editedData.deityName}
                      label='Divindade'
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          deityName: e.target.value,
                        })
                      }
                    >
                      <MenuItem value=''>Nenhuma</MenuItem>
                      {DIVINDADES_DATA.map((deity: Divindade) => (
                        <MenuItem key={deity.name} value={deity.name}>
                          {deity.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Accordion 2: Atributos */}
            <Accordion
              expanded={expandedAccordions.includes('atributos')}
              onChange={() => handleAccordionChange('atributos')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='medium'>
                  Atributos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    Ajuste os modificadores dos atributos. O valor será definido
                    automaticamente.
                  </Typography>
                  {Object.values(Atributo).map((atributo) => {
                    const attribute = editedData.attributes[atributo];
                    return (
                      <Stack
                        key={atributo}
                        direction='row'
                        spacing={2}
                        alignItems='center'
                      >
                        <Box sx={{ minWidth: '120px' }}>
                          <Typography variant='body2'>{atributo}:</Typography>
                        </Box>
                        <TextField
                          size='small'
                          type='number'
                          value={attribute.value}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10) || 0;
                            handleAttributeModifierChange(atributo, newValue);
                          }}
                          inputProps={{
                            min: -5,
                            max: 10,
                          }}
                          sx={{ width: '80px' }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Accordion 3: PV e PM */}
            <Accordion
              expanded={expandedAccordions.includes('pv-pm')}
              onChange={() => handleAccordionChange('pv-pm')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='medium'>
                  Pontos de Vida e Mana
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography
                    variant='body2'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    Customize os valores de PV e PM por nível. Deixe vazio para
                    usar o padrão da classe.
                  </Typography>
                  <TextField
                    fullWidth
                    label='PV por Nível (após 1º nível)'
                    type='number'
                    value={
                      editedData.customPVPerLevel !== undefined
                        ? editedData.customPVPerLevel
                        : ''
                    }
                    placeholder={
                      CLASSES.find(
                        (c) => c.name === editedData.className
                      )?.addpv?.toString() || '0'
                    }
                    onChange={(e) => {
                      const { value } = e.target;
                      setEditedData({
                        ...editedData,
                        customPVPerLevel:
                          value === '' ? undefined : parseInt(value, 10),
                      });
                    }}
                    helperText={`Padrão da classe ${editedData.className}: ${
                      CLASSES.find((c) => c.name === editedData.className)
                        ?.addpv || 0
                    }`}
                    inputProps={{ min: 0, max: 50 }}
                  />

                  <TextField
                    fullWidth
                    label='PM por Nível (após 1º nível)'
                    type='number'
                    value={
                      editedData.customPMPerLevel !== undefined
                        ? editedData.customPMPerLevel
                        : ''
                    }
                    placeholder={
                      CLASSES.find(
                        (c) => c.name === editedData.className
                      )?.addpm?.toString() || '0'
                    }
                    onChange={(e) => {
                      const { value } = e.target;
                      setEditedData({
                        ...editedData,
                        customPMPerLevel:
                          value === '' ? undefined : parseInt(value, 10),
                      });
                    }}
                    helperText={`Padrão da classe ${editedData.className}: ${
                      CLASSES.find((c) => c.name === editedData.className)
                        ?.addpm || 0
                    }`}
                    inputProps={{ min: 0, max: 50 }}
                  />

                  <TextField
                    fullWidth
                    label='Bônus de PV'
                    type='number'
                    value={editedData.bonusPV}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        bonusPV: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    helperText='Bônus fixo adicionado ao PV total'
                    inputProps={{ min: -100, max: 500 }}
                  />

                  <TextField
                    fullWidth
                    label='Bônus de PM'
                    type='number'
                    value={editedData.bonusPM}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        bonusPM: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    helperText='Bônus fixo adicionado ao PM total'
                    inputProps={{ min: -100, max: 500 }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant='body2'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    PV/PM Máximo Manual (sobrescreve o cálculo automático). Use
                    para ajustar o valor final exibido na ficha.
                  </Typography>

                  <TextField
                    fullWidth
                    label='PV Máximo Manual'
                    type='number'
                    value={
                      editedData.manualMaxPV !== undefined
                        ? editedData.manualMaxPV
                        : ''
                    }
                    onChange={(e) => {
                      const { value } = e.target;
                      setEditedData({
                        ...editedData,
                        manualMaxPV:
                          value === '' ? undefined : parseInt(value, 10),
                      });
                    }}
                    helperText='Se definido, substitui o valor calculado de PV'
                    inputProps={{ min: 1, max: 9999 }}
                  />

                  <TextField
                    fullWidth
                    label='PM Máximo Manual'
                    type='number'
                    value={
                      editedData.manualMaxPM !== undefined
                        ? editedData.manualMaxPM
                        : ''
                    }
                    onChange={(e) => {
                      const { value } = e.target;
                      setEditedData({
                        ...editedData,
                        manualMaxPM:
                          value === '' ? undefined : parseInt(value, 10),
                      });
                    }}
                    helperText='Se definido, substitui o valor calculado de PM'
                    inputProps={{ min: 0, max: 9999 }}
                  />

                  {/* Preview de Cálculo de PV/PM */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ mb: 1, fontWeight: 'bold' }}
                    >
                      📊 Preview do Cálculo
                    </Typography>

                    {/* PV Calculation */}
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                        PV Total: {calculatePVPreview()}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                        }}
                      >
                        {getPVCalculationFormula()}
                      </Typography>
                    </Stack>

                    {/* PM Calculation */}
                    <Stack spacing={0.5}>
                      <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                        PM Total: {calculatePMPreview()}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                        }}
                      >
                        {getPMCalculationFormula()}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
            <Button fullWidth variant='contained' onClick={handleSave}>
              Salvar
            </Button>
            <Button fullWidth variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* OriginEditDrawer for benefit selection */}
      {pendingOrigin && (
        <OriginEditDrawer
          open={originEditDrawerOpen}
          onClose={() => {
            setOriginEditDrawerOpen(false);
            setPendingOrigin(null);
            setPendingUpdates({});
          }}
          origin={pendingOrigin}
          sheet={sheet}
          onSave={handleOriginBenefitsSave}
        />
      )}

      {/* DeityPowerEditDrawer for deity power selection */}
      {pendingDeity && (
        <DeityPowerEditDrawer
          open={deityEditDrawerOpen}
          onClose={() => {
            setDeityEditDrawerOpen(false);
            setPendingDeity(null);
            setPendingUpdates({});
          }}
          deity={pendingDeity}
          sheet={sheet}
          onSave={handleDeityPowersSave}
        />
      )}
    </>
  );
};

export default SheetInfoEditDrawer;
