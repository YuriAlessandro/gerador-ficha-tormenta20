import CharacterSheet, {
  DamageType,
  SubStep,
} from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { GeneralPower } from '@/interfaces/Poderes';
import { allSpellSchools } from '@/interfaces/Spells';
import tormentaPowers from '@/data/systems/tormenta20/powers/tormentaPowers';
import originPowers from '@/data/systems/tormenta20/powers/originPowers';
import HUMANO from '@/data/systems/tormenta20/races/humano';
import MECHANICAL_MARVELS from '@/data/systems/tormenta20/ameacas-de-arton/powers/mechanicalMarvels';
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
  pickFromArray,
} from '../randomUtils';
import { getPowersAllowedByRequirements } from '../powers';
import { applyPower } from '../general';

export function applyHumanoVersatil(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const substeps: SubStep[] = [];

  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (
    sheet.humanoVersatilSkill &&
    sheet.humanoVersatilChoice &&
    !hasManualSkills &&
    !hasManualPowers
  ) {
    const storedSkill = sheet.humanoVersatilSkill as Skill;
    if (!sheet.skills.includes(storedSkill)) {
      sheet.skills.push(storedSkill);
    }

    if (sheet.humanoVersatilChoice.type === 'cleared') {
      // User explicitly removed the granted power/skill — only replay first skill
      substeps.push({
        name: 'Versátil',
        value: `Perícia treinada (${storedSkill})`,
      });
    } else if (sheet.humanoVersatilChoice.type === 'power') {
      const powerName = sheet.humanoVersatilChoice.value;
      if (!sheet.generalPowers.some((p) => p.name === powerName)) {
        const allowedPowers = getPowersAllowedByRequirements(sheet);
        const storedPower = allowedPowers.find((p) => p.name === powerName);
        if (storedPower) {
          sheet.generalPowers.push(storedPower);
        }
      }
      substeps.push({
        name: 'Versátil',
        value: `Poder geral recebido (${powerName})`,
      });
    } else {
      const storedSecondSkill = sheet.humanoVersatilChoice.value as Skill;
      if (!sheet.skills.includes(storedSecondSkill)) {
        sheet.skills.push(storedSecondSkill);
      }
      substeps.push({
        name: 'Versátil',
        value: `Perícia treinada (${storedSecondSkill})`,
      });
    }
    return substeps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  let firstSkill: Skill;
  if (hasManualSkills) {
    firstSkill = manualSelections.skills![0] as Skill;
  } else {
    firstSkill = getNotRepeatedRandom(sheet.skills, Object.values(Skill));
  }
  sheet.skills.push(firstSkill);
  sheet.humanoVersatilSkill = firstSkill;

  // Second choice: either a skill OR a general power
  if (hasManualPowers) {
    const selectedPower = manualSelections.powers![0] as GeneralPower;
    sheet.generalPowers.push(selectedPower);
    sheet.humanoVersatilChoice = { type: 'power', value: selectedPower.name };
    substeps.push({
      name: 'Versátil',
      value: `Poder geral recebido (${selectedPower.name})`,
    });
  } else if (hasManualSkills && manualSelections.skills!.length >= 2) {
    const secondSkill = manualSelections.skills![1] as Skill;
    sheet.skills.push(secondSkill);
    sheet.humanoVersatilChoice = { type: 'skill', value: secondSkill };
    substeps.push({
      name: 'Versátil',
      value: `Perícia treinada (${secondSkill})`,
    });
  } else {
    const shouldGetSkill = Math.random() > 0.5;

    if (shouldGetSkill) {
      const randomSecondSkill = getNotRepeatedRandom(
        sheet.skills,
        Object.values(Skill)
      );
      sheet.skills.push(randomSecondSkill);
      sheet.humanoVersatilChoice = { type: 'skill', value: randomSecondSkill };
      substeps.push({
        name: 'Versátil',
        value: `Perícia treinada (${randomSecondSkill})`,
      });
    } else {
      const allowedPowers = getPowersAllowedByRequirements(sheet);
      const randomPower = getNotRepeatedRandom(
        sheet.generalPowers,
        allowedPowers
      );
      sheet.generalPowers.push(randomPower);
      sheet.humanoVersatilChoice = { type: 'power', value: randomPower.name };
      substeps.push({
        name: 'Versátil',
        value: `Poder geral recebido (${randomPower.name})`,
      });
    }
  }

  return substeps;
}

export function applyLefouDeformidade(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const subSteps: SubStep[] = [];

  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // DETERMINISTIC PATH: If selections were already stored, replay them
  if (sheet.lefouDeformidadeSkills && !hasManualSkills && !hasManualPowers) {
    sheet.lefouDeformidadeSkills.forEach((skill) => {
      sheet.sheetBonuses.push({
        source: { type: 'power', name: 'Deformidade' },
        target: { type: 'Skill', name: skill as Skill },
        modifier: { type: 'Fixed', value: 2 },
      });
      subSteps.push({
        name: 'Deformidade',
        value: `+2 em Perícia (${skill})`,
      });
    });

    if (sheet.lefouDeformidadePower) {
      if (
        !sheet.generalPowers.some((p) => p.name === sheet.lefouDeformidadePower)
      ) {
        const allowedPowers = Object.values(tormentaPowers);
        const storedPower = allowedPowers.find(
          (p) => p.name === sheet.lefouDeformidadePower
        );
        if (storedPower) {
          sheet.generalPowers.push(storedPower);
        }
      }
      subSteps.push({
        name: 'Deformidade',
        value: `Poder da Tormenta recebido (${sheet.lefouDeformidadePower})`,
      });
    }
    return subSteps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  if (hasManualSkills) {
    const selectedSkills = manualSelections.skills!;
    sheet.lefouDeformidadeSkills = selectedSkills.map((s) => s as string);

    selectedSkills.forEach((skill) => {
      sheet.sheetBonuses.push({
        source: { type: 'power', name: 'Deformidade' },
        target: { type: 'Skill', name: skill as Skill },
        modifier: { type: 'Fixed', value: 2 },
      });
      subSteps.push({
        name: 'Deformidade',
        value: `+2 em Perícia (${skill})`,
      });
    });

    if (hasManualPowers) {
      const selectedPower = manualSelections.powers![0] as GeneralPower;
      sheet.generalPowers.push(selectedPower);
      sheet.lefouDeformidadePower = selectedPower.name;
      subSteps.push({
        name: 'Deformidade',
        value: `Poder da Tormenta recebido (${selectedPower.name})`,
      });
    }
  } else {
    const allSkills = Object.values(Skill);
    const shouldGetTwoSkills = Math.random() < 0.5;

    const pickedSkills = pickFromArray(allSkills, shouldGetTwoSkills ? 2 : 1);
    sheet.lefouDeformidadeSkills = pickedSkills.map((s) => s as string);

    pickedSkills.forEach((randomSkill) => {
      sheet.sheetBonuses.push({
        source: { type: 'power', name: 'Deformidade' },
        target: { type: 'Skill', name: randomSkill },
        modifier: { type: 'Fixed', value: 2 },
      });
      subSteps.push({
        name: 'Deformidade',
        value: `+2 em Perícia (${randomSkill})`,
      });
    });

    if (!shouldGetTwoSkills) {
      const allowedPowers = Object.values(tormentaPowers);
      const randomPower = getNotRepeatedRandom(
        sheet.generalPowers,
        allowedPowers
      );
      sheet.generalPowers.push(randomPower);
      sheet.lefouDeformidadePower = randomPower.name;

      subSteps.push({
        name: 'Deformidade',
        value: `Poder da Tormenta recebido (${randomPower.name})`,
      });
    }
  }

  return subSteps;
}

export function applyOsteonMemoriaPostuma(
  _sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const subSteps: SubStep[] = [];

  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;
  const hasManualRaceAbilities =
    manualSelections?.raceAbilities &&
    manualSelections.raceAbilities.length > 0;

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (
    _sheet.osteonMemoriaPostumaChoice &&
    !hasManualSkills &&
    !hasManualPowers &&
    !hasManualRaceAbilities
  ) {
    const { type, value } = _sheet.osteonMemoriaPostumaChoice;
    if (type === 'skill') {
      const skill = value as Skill;
      if (!_sheet.skills.includes(skill)) {
        _sheet.skills.push(skill);
      }
      subSteps.push({
        name: 'Memória Póstuma',
        value: `Perícia treinada (${skill})`,
      });
    } else if (type === 'power') {
      if (!_sheet.generalPowers.some((p) => p.name === value)) {
        const allowedPowers = getPowersAllowedByRequirements(_sheet);
        const storedPower = allowedPowers.find((p) => p.name === value);
        if (storedPower) {
          _sheet.generalPowers.push(storedPower);
        }
      }
      subSteps.push({
        name: 'Memória Póstuma',
        value: `Poder geral recebido (${value})`,
      });
    } else if (type === 'raceAbility') {
      if (_sheet.raca.oldRace?.abilities) {
        const ability = _sheet.raca.oldRace.abilities.find(
          (a) => a.name === value
        );
        if (ability) {
          if (!_sheet.raca.abilities?.some((a) => a.name === value)) {
            _sheet.raca.abilities?.push(ability);
          }
          subSteps.push({
            name: 'Memória Póstuma',
            value: `${_sheet.raca.oldRace.name} (${ability.name})`,
          });
          applyPower(_sheet, ability);
        }
      }
    }
    return subSteps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  if (_sheet.raca.oldRace) {
    if (_sheet.raca.oldRace.name === HUMANO.name) {
      if (hasManualSkills) {
        const skill = manualSelections.skills![0] as Skill;
        _sheet.skills.push(skill);
        _sheet.osteonMemoriaPostumaChoice = { type: 'skill', value: skill };
        subSteps.push({
          name: 'Memória Póstuma',
          value: `Perícia treinada (${skill})`,
        });
      } else if (hasManualPowers) {
        const power = manualSelections.powers![0] as GeneralPower;
        _sheet.generalPowers.push(power);
        _sheet.osteonMemoriaPostumaChoice = {
          type: 'power',
          value: power.name,
        };
        subSteps.push({
          name: 'Memória Póstuma',
          value: `Poder geral recebido (${power.name})`,
        });
      } else {
        // Random fallback
        const shouldGetSkill = Math.random() > 0.5;
        if (shouldGetSkill) {
          const randomSkill = getNotRepeatedRandom(
            _sheet.skills,
            Object.values(Skill)
          );
          _sheet.skills.push(randomSkill);
          _sheet.osteonMemoriaPostumaChoice = {
            type: 'skill',
            value: randomSkill,
          };
          subSteps.push({
            name: 'Memória Póstuma',
            value: `Perícia treinada (${randomSkill})`,
          });
        } else {
          const allowedPowers = getPowersAllowedByRequirements(_sheet);
          const randomPower = getNotRepeatedRandom(
            _sheet.generalPowers,
            allowedPowers
          );
          _sheet.generalPowers.push(randomPower);
          _sheet.osteonMemoriaPostumaChoice = {
            type: 'power',
            value: randomPower.name,
          };
          subSteps.push({
            name: 'Memória Póstuma',
            value: `Poder geral recebido (${randomPower.name})`,
          });
        }
      }
    } else if (_sheet.raca.oldRace.abilities) {
      if (hasManualRaceAbilities) {
        const selectedAbilityName =
          manualSelections.raceAbilities![0].abilityName;
        const ability = _sheet.raca.oldRace.abilities.find(
          (a) => a.name === selectedAbilityName
        );
        if (ability) {
          _sheet.raca.abilities?.push(ability);
          _sheet.osteonMemoriaPostumaChoice = {
            type: 'raceAbility',
            value: ability.name,
          };
          subSteps.push({
            name: 'Memória Póstuma',
            value: `${_sheet.raca.oldRace.name} (${ability.name})`,
          });
          applyPower(_sheet, ability);
        }
      } else {
        // Random fallback
        const randomAbility = getRandomItemFromArray(
          _sheet.raca.oldRace.abilities
        );
        _sheet.raca.abilities?.push(randomAbility);
        _sheet.osteonMemoriaPostumaChoice = {
          type: 'raceAbility',
          value: randomAbility.name,
        };
        subSteps.push({
          name: 'Memória Póstuma',
          value: `${_sheet.raca.oldRace.name} (${randomAbility.name})`,
        });
        applyPower(_sheet, randomAbility);
      }
    }
  }

  return subSteps;
}

export function applyYidishanNaturezaOrganica(
  _sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const subSteps: SubStep[] = [];

  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;
  const hasManualRaceAbilities =
    manualSelections?.raceAbilities &&
    manualSelections.raceAbilities.length > 0;

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (
    _sheet.yidishanNaturezaChoice &&
    !hasManualSkills &&
    !hasManualPowers &&
    !hasManualRaceAbilities
  ) {
    const { type, value } = _sheet.yidishanNaturezaChoice;
    if (type === 'skill') {
      const skill = value as Skill;
      if (!_sheet.skills.includes(skill)) {
        _sheet.skills.push(skill);
      }
      subSteps.push({
        name: 'Natureza Orgânica',
        value: `Perícia treinada (${skill})`,
      });
    } else if (type === 'power') {
      if (!_sheet.generalPowers.some((p) => p.name === value)) {
        const allowedPowers = getPowersAllowedByRequirements(_sheet);
        const storedPower = allowedPowers.find((p) => p.name === value);
        if (storedPower) {
          _sheet.generalPowers.push(storedPower);
        }
      }
      subSteps.push({
        name: 'Natureza Orgânica',
        value: `Poder geral recebido (${value})`,
      });
    } else if (type === 'raceAbility') {
      if (_sheet.raca.oldRace?.abilities) {
        const ability = _sheet.raca.oldRace.abilities.find(
          (a) => a.name === value
        );
        if (ability) {
          if (!_sheet.raca.abilities?.some((a) => a.name === value)) {
            _sheet.raca.abilities?.push(ability);
          }
          subSteps.push({
            name: 'Natureza Orgânica',
            value: `${_sheet.raca.oldRace.name} (${ability.name})`,
          });
          applyPower(_sheet, ability);
        }
      }
    }
    return subSteps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  if (hasManualSkills) {
    const skill = manualSelections.skills![0] as Skill;
    if (!_sheet.skills.includes(skill)) {
      _sheet.skills.push(skill);
    }
    _sheet.yidishanNaturezaChoice = { type: 'skill', value: skill };
    subSteps.push({
      name: 'Natureza Orgânica',
      value: `Perícia treinada (${skill})`,
    });
  } else if (hasManualPowers) {
    const power = manualSelections.powers![0] as GeneralPower;
    if (!_sheet.generalPowers.some((p) => p.name === power.name)) {
      _sheet.generalPowers.push(power);
    }
    _sheet.yidishanNaturezaChoice = {
      type: 'power',
      value: power.name,
    };
    subSteps.push({
      name: 'Natureza Orgânica',
      value: `Poder geral recebido (${power.name})`,
    });
  } else if (hasManualRaceAbilities && _sheet.raca.oldRace?.abilities) {
    const selectedAbilityName = manualSelections.raceAbilities![0].abilityName;
    const ability = _sheet.raca.oldRace.abilities.find(
      (a) => a.name === selectedAbilityName
    );
    if (ability) {
      if (!_sheet.raca.abilities?.some((a) => a.name === ability.name)) {
        _sheet.raca.abilities?.push(ability);
      }
      _sheet.yidishanNaturezaChoice = {
        type: 'raceAbility',
        value: ability.name,
      };
      subSteps.push({
        name: 'Natureza Orgânica',
        value: `${_sheet.raca.oldRace.name} (${ability.name})`,
      });
      applyPower(_sheet, ability);
    }
  } else if (_sheet.raca.oldRace) {
    // RANDOM fallback
    if (_sheet.raca.oldRace.name === HUMANO.name) {
      const shouldGetSkill = Math.random() > 0.5;
      if (shouldGetSkill) {
        const randomSkill = getNotRepeatedRandom(
          _sheet.skills,
          Object.values(Skill)
        );
        _sheet.skills.push(randomSkill);
        _sheet.yidishanNaturezaChoice = { type: 'skill', value: randomSkill };
        subSteps.push({
          name: 'Natureza Orgânica',
          value: `Perícia treinada (${randomSkill})`,
        });
      } else {
        const allowedPowers = getPowersAllowedByRequirements(_sheet);
        const randomPower = getNotRepeatedRandom(
          _sheet.generalPowers,
          allowedPowers
        );
        _sheet.generalPowers.push(randomPower);
        _sheet.yidishanNaturezaChoice = {
          type: 'power',
          value: randomPower.name,
        };
        subSteps.push({
          name: 'Natureza Orgânica',
          value: `Poder geral recebido (${randomPower.name})`,
        });
      }
    } else if (_sheet.raca.oldRace.abilities) {
      const randomAbility = getRandomItemFromArray(
        _sheet.raca.oldRace.abilities
      );
      _sheet.raca.abilities?.push(randomAbility);
      _sheet.yidishanNaturezaChoice = {
        type: 'raceAbility',
        value: randomAbility.name,
      };
      subSteps.push({
        name: 'Natureza Orgânica',
        value: `${_sheet.raca.oldRace.name} (${randomAbility.name})`,
      });
      applyPower(_sheet, randomAbility);
    }
  }

  return subSteps;
}

export function applyMeioElfoAmbicaoHerdada(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const substeps: SubStep[] = [];

  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (
    sheet.meioElfoAmbicaoType &&
    sheet.meioElfoAmbicaoPower &&
    !hasManualPowers
  ) {
    if (sheet.meioElfoAmbicaoType === 'generalPower') {
      if (
        !sheet.generalPowers.some((p) => p.name === sheet.meioElfoAmbicaoPower)
      ) {
        const allowedPowers = getPowersAllowedByRequirements(sheet);
        const storedPower = allowedPowers.find(
          (p) => p.name === sheet.meioElfoAmbicaoPower
        );
        if (storedPower) {
          sheet.generalPowers.push(storedPower);
        }
      }
      substeps.push({
        name: 'Ambição Herdada',
        value: `Poder geral recebido (${sheet.meioElfoAmbicaoPower})`,
      });
    } else if (sheet.meioElfoAmbicaoType === 'originPower') {
      const allOriginPowers = Object.values(originPowers);
      const storedOriginPower = allOriginPowers.find(
        (p) => p.name === sheet.meioElfoAmbicaoPower
      );
      if (storedOriginPower) {
        if (
          sheet.origin &&
          !sheet.origin.powers.some((p) => p.name === storedOriginPower.name)
        ) {
          sheet.origin.powers.push(storedOriginPower);
        }
        const [newSheet] = applyPower(sheet, storedOriginPower);
        sheet.skills = newSheet.skills;
        sheet.spells = newSheet.spells;
        sheet.sheetBonuses = newSheet.sheetBonuses;
        sheet.sheetActionHistory = newSheet.sheetActionHistory;
        sheet.atributos = newSheet.atributos;
        sheet.sentidos = newSheet.sentidos;
      }
      substeps.push({
        name: 'Ambição Herdada',
        value: `Poder único de origem recebido (${sheet.meioElfoAmbicaoPower})`,
      });
    }
    return substeps;
  }

  // If the user intentionally cleared the Ambição Herdada power via editing,
  // do not re-add it or select a new one.
  if (sheet.meioElfoAmbicaoType === 'cleared') {
    return substeps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  if (hasManualPowers) {
    const selectedPower = manualSelections.powers![0];
    sheet.generalPowers.push(selectedPower as GeneralPower);
    sheet.meioElfoAmbicaoType = 'generalPower';
    sheet.meioElfoAmbicaoPower = selectedPower.name;
    substeps.push({
      name: 'Ambição Herdada',
      value: `Poder geral recebido (${selectedPower.name})`,
    });
  } else {
    // Random selection for initial generation
    const shouldGetGeneralPower = Math.random() > 0.5;

    if (shouldGetGeneralPower) {
      const allowedPowers = getPowersAllowedByRequirements(sheet);
      const randomPower = getNotRepeatedRandom(
        sheet.generalPowers,
        allowedPowers
      );
      sheet.generalPowers.push(randomPower);
      sheet.meioElfoAmbicaoType = 'generalPower';
      sheet.meioElfoAmbicaoPower = randomPower.name;
      substeps.push({
        name: 'Ambição Herdada',
        value: `Poder geral recebido (${randomPower.name})`,
      });
    } else {
      // Get a random origin power
      const allOriginPowers = Object.values(originPowers);
      const randomOriginPower = getRandomItemFromArray(allOriginPowers);
      if (sheet.origin) {
        sheet.origin.powers.push(randomOriginPower);
      }
      sheet.meioElfoAmbicaoType = 'originPower';
      sheet.meioElfoAmbicaoPower = randomOriginPower.name;
      substeps.push({
        name: 'Ambição Herdada',
        value: `Poder único de origem recebido (${randomOriginPower.name})`,
      });

      // Apply the origin power's effects
      const [newSheet] = applyPower(sheet, randomOriginPower);
      sheet.skills = newSheet.skills;
      sheet.spells = newSheet.spells;
      sheet.sheetBonuses = newSheet.sheetBonuses;
      sheet.sheetActionHistory = newSheet.sheetActionHistory;
      sheet.atributos = newSheet.atributos;
      sheet.sentidos = newSheet.sentidos;
    }
  }

  return substeps;
}

const QAREEN_ELEMENTS: { name: string; damageType: DamageType }[] = [
  { name: 'Água', damageType: 'Frio' },
  { name: 'Ar', damageType: 'Eletricidade' },
  { name: 'Fogo', damageType: 'Fogo' },
  { name: 'Terra', damageType: 'Ácido' },
  { name: 'Luz', damageType: 'Luz' },
  { name: 'Trevas', damageType: 'Trevas' },
];

export function applyQareenResistenciaElemental(
  sheet: CharacterSheet
): SubStep[] {
  const substeps: SubStep[] = [];

  // Use pre-selected element (from wizard) or pick randomly
  let element: (typeof QAREEN_ELEMENTS)[number];
  if (sheet.qareenElement) {
    const found = QAREEN_ELEMENTS.find(
      (e) => e.damageType === sheet.qareenElement
    );
    element = found || getRandomItemFromArray(QAREEN_ELEMENTS);
  } else {
    element = getRandomItemFromArray(QAREEN_ELEMENTS);
  }

  sheet.qareenElement = element.damageType;

  sheet.sheetBonuses.push({
    source: { type: 'power', name: 'Resistência Elemental' },
    target: { type: 'DamageReduction', damageType: element.damageType },
    modifier: { type: 'Fixed', value: 10 },
  });

  substeps.push({
    name: 'Resistência Elemental',
    value: `Qareen ${element.name} — RD de ${element.damageType} 10`,
  });

  return substeps;
}

export function applyAlmaLivreSelectClass(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const substeps: SubStep[] = [];

  if (manualSelections?.almaLivreClass && manualSelections?.almaLivrePower) {
    sheet.almaLivreClass = manualSelections.almaLivreClass;
    sheet.almaLivrePower = manualSelections.almaLivrePower;

    substeps.push({
      name: 'Alma Livre',
      value: `Classe: ${manualSelections.almaLivreClass} — Poder: ${manualSelections.almaLivrePower.name}`,
    });
  }

  return substeps;
}

export function applyTeurgistaMistico(sheet: CharacterSheet): SubStep[] {
  const substeps: SubStep[] = [];

  if (!sheet.classe.spellPath) {
    return substeps;
  }

  const { spellType } = sheet.classe.spellPath;

  if (spellType === 'Arcane') {
    if (
      !sheet.classe.spellPath.includeDivineSchools ||
      sheet.classe.spellPath.includeDivineSchools.length === 0
    ) {
      sheet.classe.spellPath.includeDivineSchools = allSpellSchools;
    }
    sheet.classe.spellPath.crossTraditionLimit = 1;
    substeps.push({
      name: 'Teurgista Místico',
      value: 'Pode escolher até 1 magia divina por círculo',
    });
  } else if (spellType === 'Divine') {
    sheet.classe.spellPath.includeArcaneSchools = allSpellSchools;
    sheet.classe.spellPath.crossTraditionLimit = 1;
    substeps.push({
      name: 'Teurgista Místico',
      value: 'Pode escolher até 1 magia arcana por círculo',
    });
  }

  return substeps;
}

export function applyMashinChassi(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const substeps: SubStep[] = [];

  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // DETERMINISTIC PATH: If selection was already stored, replay it
  if (
    sheet.mashinChassiSkill &&
    sheet.mashinChassiChoice &&
    !hasManualSkills &&
    !hasManualPowers
  ) {
    const storedSkill = sheet.mashinChassiSkill as Skill;
    if (!sheet.skills.includes(storedSkill)) {
      sheet.skills.push(storedSkill);
    }
    substeps.push({
      name: 'Chassi Mashin',
      value: `Perícia treinada (${storedSkill})`,
    });

    if (sheet.mashinChassiChoice.type === 'power') {
      if (
        !sheet.generalPowers.some(
          (p) => p.name === sheet.mashinChassiChoice!.value
        )
      ) {
        const storedMarvel = MECHANICAL_MARVELS.find(
          (m) => m.name === sheet.mashinChassiChoice!.value
        );
        if (storedMarvel) {
          sheet.generalPowers.push(storedMarvel);
        }
      }
      substeps.push({
        name: 'Chassi Mashin',
        value: `Maravilha Mecânica recebida (${sheet.mashinChassiChoice.value})`,
      });
    } else {
      const storedSecondSkill = sheet.mashinChassiChoice.value as Skill;
      if (!sheet.skills.includes(storedSecondSkill)) {
        sheet.skills.push(storedSecondSkill);
      }
      substeps.push({
        name: 'Chassi Mashin',
        value: `Perícia treinada (${storedSecondSkill})`,
      });
    }
    return substeps;
  }

  // MANUAL or RANDOM PATH: First-time generation
  let firstSkill: Skill;
  if (hasManualSkills) {
    firstSkill = manualSelections.skills![0] as Skill;
  } else {
    firstSkill = getNotRepeatedRandom(sheet.skills, Object.values(Skill));
  }
  sheet.skills.push(firstSkill);
  sheet.mashinChassiSkill = firstSkill;
  substeps.push({
    name: 'Chassi Mashin',
    value: `Perícia treinada (${firstSkill})`,
  });

  if (hasManualPowers) {
    const selectedMarvel = manualSelections.powers![0] as GeneralPower;
    sheet.generalPowers.push(selectedMarvel);
    sheet.mashinChassiChoice = { type: 'power', value: selectedMarvel.name };
    substeps.push({
      name: 'Chassi Mashin',
      value: `Maravilha Mecânica recebida (${selectedMarvel.name})`,
    });
  } else if (hasManualSkills && manualSelections.skills!.length >= 2) {
    const secondSkill = manualSelections.skills![1] as Skill;
    sheet.skills.push(secondSkill);
    sheet.mashinChassiChoice = { type: 'skill', value: secondSkill };
    substeps.push({
      name: 'Chassi Mashin',
      value: `Perícia treinada (${secondSkill})`,
    });
  } else {
    const shouldGetSkill = Math.random() > 0.5;

    if (shouldGetSkill) {
      const randomSecondSkill = getNotRepeatedRandom(
        sheet.skills,
        Object.values(Skill)
      );
      sheet.skills.push(randomSecondSkill);
      sheet.mashinChassiChoice = { type: 'skill', value: randomSecondSkill };
      substeps.push({
        name: 'Chassi Mashin',
        value: `Perícia treinada (${randomSecondSkill})`,
      });
    } else {
      const availableMarvels = MECHANICAL_MARVELS.filter(
        (marvel) => !sheet.generalPowers.some((gp) => gp.name === marvel.name)
      );
      if (availableMarvels.length > 0) {
        const randomMarvel = getRandomItemFromArray(availableMarvels);
        sheet.generalPowers.push(randomMarvel);
        sheet.mashinChassiChoice = { type: 'power', value: randomMarvel.name };
        substeps.push({
          name: 'Chassi Mashin',
          value: `Maravilha Mecânica recebida (${randomMarvel.name})`,
        });
      } else {
        const fallbackSkill = getNotRepeatedRandom(
          sheet.skills,
          Object.values(Skill)
        );
        sheet.skills.push(fallbackSkill);
        sheet.mashinChassiChoice = { type: 'skill', value: fallbackSkill };
        substeps.push({
          name: 'Chassi Mashin',
          value: `Perícia treinada (${fallbackSkill})`,
        });
      }
    }
  }

  return substeps;
}
