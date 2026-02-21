import { Atributo } from '@/data/systems/tormenta20/atributos';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ClassAbility, ClassPower } from '@/interfaces/Class';
import Equipment from '@/interfaces/Equipment';
import { OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import { PDFDocument } from 'pdf-lib';

function filterUniqueByName<T extends { name: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

const generateClassPowerText = (power: ClassPower | ClassAbility) =>
  power.text || '';
const generateGeneralPowerText = (power: RaceAbility | OriginPower) =>
  power.description || '';

const preparePDF: (
  sheet: CharacterSheet
) => Promise<Uint8Array<ArrayBufferLike>> = async (sheet) => {
  const url = 'https://fichasdenimb.com.br/sheet.pdf';
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // Get all fields in the PDF
  const nameField = form.getTextField('Nome');
  const raceField = form.getTextField('Raca');
  const originField = form.getTextField('Origem');
  const classField = form.getTextField('Classe');
  const deytiField = form.getTextField('Divindade');

  const forceField = form.getTextField('modFor');
  const dexterityField = form.getTextField('modDes');
  const constitutionField = form.getTextField('modCon');
  const intelligenceField = form.getTextField('modInt');
  const wisdomField = form.getTextField('modSab');
  const charismaField = form.getTextField('modCar');

  const pvMaxField = form.getTextField('vidaMax');
  const pmMaxField = form.getTextField('manaMax');
  const modDefense = form.getDropdown('modDef');
  const defenseField = form.getTextField('Texto13');
  const displacimentField = form.getTextField('deslocamento');
  const proficienciesField = form.getTextField('caracteristicas');
  const halfLevelField = form.getTextField('metadeDoNivel');

  const equipamentsFirstField = form.getTextField('item1');
  const equipamentsSecondField = form.getTextField('item2');
  const currentCargoField = form.getTextField('cargaAtual');
  const maxCargoField = form.getTextField('cargaMaxima');
  const carryCapacityField = form.getTextField('levantar');

  const powersField = form.getTextField('Historico');
  const spellsField = form.getTextField('Atualização');

  const craftSkillFirstField = form.getTextField('Texto8');
  const craftSkillSecondField = form.getTextField('Texto9');

  nameField.setText(sheet.nome);
  raceField.setText(sheet.raca.name);
  originField.setText(sheet.origin?.name || '');
  const classDisplay =
    sheet.classe.isVariant && sheet.classe.baseClassName
      ? `${sheet.classe.name} (${sheet.classe.baseClassName}) ${sheet.nivel}`
      : `${sheet.classe.name} ${sheet.nivel}`;
  classField.setText(classDisplay);
  deytiField.setText(sheet.devoto?.divindade.name || '');
  forceField.setText(sheet.atributos.Força.value.toString());
  dexterityField.setText(sheet.atributos.Destreza.value.toString());
  constitutionField.setText(sheet.atributos.Constituição.value.toString());
  intelligenceField.setText(sheet.atributos.Inteligência.value.toString());
  wisdomField.setText(sheet.atributos.Sabedoria.value.toString());
  charismaField.setText(sheet.atributos.Carisma.value.toString());
  displacimentField.setText(sheet.displacement.toString());
  halfLevelField.setText(Math.floor(sheet.nivel / 2).toString());

  pvMaxField.setText(sheet.pv.toString());
  pmMaxField.setText(sheet.pm.toString());

  // Add sheet equipaments
  const bagEquipaments = sheet.bag.getEquipments();
  const weapons = bagEquipaments.Arma;

  const fightSkill = sheet.completeSkills?.find(
    (skill) => skill.name === 'Luta'
  );
  const rangeSkill = sheet.completeSkills?.find(
    (skill) => skill.name === 'Pontaria'
  );

  const fightAttrBonus = fightSkill?.modAttr
    ? sheet.atributos[fightSkill.modAttr].value
    : 0;
  const fightBonus =
    (fightSkill?.halfLevel ?? 0) +
    fightAttrBonus +
    (fightSkill?.others ?? 0) +
    (fightSkill?.training ?? 0);

  const rangeAttrBonus = rangeSkill?.modAttr
    ? sheet.atributos[rangeSkill.modAttr].value
    : 0;
  const rangeBonus =
    (rangeSkill?.halfLevel ?? 0) +
    rangeAttrBonus +
    (rangeSkill?.others ?? 0) +
    (rangeSkill?.training ?? 0);

  weapons.forEach((weapon, index) => {
    const weaponNameField = form.getTextField(`ataque${index + 1}`);
    const weaponBonusField = form.getTextField(`tAtak${index + 1}`);
    const weaponDamageField = form.getTextField(`dano${index + 1}`);
    const weaponCritField = form.getTextField(`critico${index + 1}`);
    const weaponTypeField = form.getTextField(`tipo${index + 1}`);
    const weaponRangeField = form.getTextField(`alcance${index + 1}`);

    weaponNameField.setText(weapon.nome);
    weaponDamageField.setText(weapon.dano);
    weaponCritField.setText(weapon.critico);
    weaponTypeField.setText(weapon.tipo || '');
    weaponRangeField.setText(weapon.alcance || '');

    const isRange = weapon.alcance && weapon.alcance !== '-';

    const modAtk = isRange ? rangeBonus : fightBonus;
    const atk = weapon.atkBonus ? weapon.atkBonus + modAtk : modAtk;
    weaponBonusField.setText(`${atk >= 0 ? '+' : ''}${atk}`);
  });

  const defenseEquipments = bagEquipaments.Armadura.concat(
    bagEquipaments.Escudo
  );
  defenseEquipments.forEach((defense, index) => {
    const defenseNameField = form.getTextField(`armadura${index + 1}`);
    const defenseBonusField = form.getTextField(`defesa${index + 1}`);
    const penaltyField = form.getTextField(`penalidade${index + 1}`);

    defenseNameField.setText(defense.nome);
    defenseBonusField.setText(
      `${defense.defenseBonus >= 0 ? '+' : ''}${defense.defenseBonus}`
    );
    penaltyField.setText(
      `${defense.armorPenalty >= 0 ? '+' : ''}${defense.armorPenalty}`
    );
  });

  // Add remain equipments
  const equipsEntriesNoWeapons: Equipment[] = Object.entries(
    sheet.bag.getEquipments()
  )
    .filter(([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo')
    .flatMap((value) => value[1]);

  // Concanenate all equipments names into one string
  const equipmentsNames = equipsEntriesNoWeapons
    .map(
      (equip) =>
        `${equip.nome}${equip.spaces ? ` (${equip.spaces} espaços)` : ''}`
    )
    .join('\n');

  const weaponsNames = weapons
    .map(
      (weapon) =>
        `${weapon.nome}${weapon.spaces ? ` (${weapon.spaces} espaços)` : ''}`
    )
    .join('\n');

  const defenseNames = defenseEquipments
    .map(
      (defense) =>
        `${defense.nome}${defense.spaces ? ` (${defense.spaces} espaços)` : ''}`
    )
    .join('\n');

  const allEquipments = `${equipmentsNames}\n${weaponsNames}\n${defenseNames}`;
  equipamentsFirstField.setText(allEquipments.slice(0, 1000));
  equipamentsSecondField.setText(allEquipments.slice(1000, 2000));

  // Add equipment current cargo
  const currentCargo = sheet.bag.getSpaces();
  currentCargoField.setText(`${currentCargo}`);
  const maxCargo = sheet.maxSpaces;
  maxCargoField.setText(`${maxCargo}`);
  carryCapacityField.setText(`${maxCargo * 2}`);

  // Add defense bonus
  const defenseBonus = sheet.defesa;
  modDefense.select('modDes');
  defenseField.setText(`${defenseBonus}`);

  // Add powers as one big string
  const { generalPowers } = sheet;
  const classPowers = sheet.classPowers || [];
  const classAbilities = sheet.classe.abilities;
  const raceAbilities = sheet.raca.abilities;
  const originPowers = sheet.origin?.powers || [];
  const deityPowers = sheet.devoto?.poderes || [];

  // Count how many times a power with the same name appears
  const allPowers = [
    ...classPowers,
    ...raceAbilities,
    ...classAbilities,
    ...originPowers,
    ...deityPowers,
    ...generalPowers,
  ];
  const powerCount: Record<string, number> = {};
  allPowers.forEach((power) => {
    powerCount[power.name] = (powerCount[power.name] || 0) + 1;
  });

  const uniquePowers = [
    ...filterUniqueByName(classPowers),
    ...filterUniqueByName(raceAbilities),
    ...filterUniqueByName(classAbilities),
    ...filterUniqueByName(originPowers),
    ...filterUniqueByName(deityPowers),
    ...filterUniqueByName(generalPowers),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const powersText = uniquePowers
    .map((power) => {
      const count = powerCount[power.name];
      const countSuffix = count > 1 ? ` (x${count})` : '';
      return `- ${power.name}${countSuffix}: ${generateClassPowerText(
        power as ClassPower
      )}${generateGeneralPowerText(power as RaceAbility | OriginPower)}`;
    })
    .join('\n');
  powersField.setText(powersText);
  const powersFieldFontSize = () => {
    if (powersText.length > 7000) {
      return 6;
    }
    if (powersText.length > 5000) {
      return 7;
    }
    if (powersText.length > 3000) {
      return 8;
    }
    return 10;
  };
  powersField.setFontSize(powersFieldFontSize());

  // Add spells
  const spells = sheet.spells || [];
  const spellsText = spells.map((spell) => spell.nome).join('\n');
  spellsField.setText(spellsText);

  // Proficiencies
  const baseProficiencies = sheet.classe.proficiencias.filter(
    (p) => !(sheet.removedProficiencias ?? []).includes(p)
  );
  const customProficiencies = sheet.customProficiencias ?? [];
  const proficienciesText = [...baseProficiencies, ...customProficiencies].join(
    '\n'
  );
  proficienciesField.setText(proficienciesText);

  // The PDF sheet only allows 30 skills, being two max "Oficios". We need to make sure we don't exceed that.
  // If there is more than 2 "Oficios", we will remove the extra ones. If there is only one, let's create a empty one (we need always two).
  const skills =
    sheet.completeSkills?.filter((skill) => !skill.name.includes('Ofício')) ||
    [];
  const oficioSkills =
    sheet.completeSkills?.filter((skill) => skill.name.includes('Ofício')) ||
    [];
  if (oficioSkills.length > 2) {
    oficioSkills.splice(2);
  } else if (oficioSkills.length === 1) {
    // If there is only one "Ofício", we will add an empty one to make sure there are two.
    oficioSkills.push({
      training: 0,
      others: 0,
      halfLevel: 0,
      modAttr: Atributo.INTELIGENCIA,
      countAsTormentaPower: false,
      name: Skill.OFICIO,
    });
  }
  skills.push(...oficioSkills);

  // Add skills
  skills
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((skill, index) => {
      const skillTotalField =
        index === 22
          ? form.getTextField(`tota${index + 1}`)
          : form.getTextField(`total${index + 1}`);
      const skillAttrField = form.getDropdown(`modSelect${index}`);
      const skillTrainingValueField = form.getTextField(`treino${index}`);
      const skillIsTrainedField = form.getCheckBox(`treinado${index + 1}`);
      const skillOthersField = form.getTextField(`outros${index + 1}`);

      const attrValue = skill.modAttr
        ? sheet.atributos[skill.modAttr].value
        : 0;

      const skillTotal =
        (skill.halfLevel ?? 0) +
        (attrValue ?? 0) +
        (skill.others ?? 0) +
        (skill.training ?? 0);

      // Fill fields
      skillTotalField.setText(`${skillTotal}`);
      switch (skill.modAttr) {
        case 'Força':
          skillAttrField.select('modFor');
          break;
        case 'Destreza':
          skillAttrField.select('modDes');
          break;
        case 'Constituição':
          skillAttrField.select('modCon');
          break;
        case 'Inteligência':
          skillAttrField.select('modInt');
          break;
        case 'Sabedoria':
          skillAttrField.select('modSab');
          break;
        case 'Carisma':
          skillAttrField.select('modCar');
          break;
        default:
          skillAttrField.select('modDes');
          break;
      }
      skillTrainingValueField.setText(`${skill.training ?? 0}`);
      const isTrained = (skill.training ?? 0) > 0;
      if (isTrained) skillIsTrainedField.check();
      else skillIsTrainedField.uncheck();
      skillOthersField.setText(`${skill.others ?? 0}`);

      // If the current skill is some kind of "Oficio", we will add the text between the parantheses
      if (skill.name.includes('Ofício')) {
        // Use regex to get the text between the parantheses
        const oficioMatch = skill.name.match(/Ofício\s*(.*)/);
        const oficioText = oficioMatch ? oficioMatch[1] : '';
        // There are two "Oficio" fields in the PDF, the first is for skill index 22, the second for index 23
        // So we need to check the index
        if (oficioText) {
          const oficioField =
            index === 22 ? craftSkillFirstField : craftSkillSecondField;
          oficioField.setText(oficioText.replace('(', '').replace(')', ''));
        }
      }
    });

  pdfDoc.setTitle(`Ficha de ${sheet.nome}`);
  pdfDoc.setAuthor('Fichas de Nimb');
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

export default preparePDF;
