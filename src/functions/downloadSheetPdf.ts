import CharacterSheet from '@/interfaces/CharacterSheet';
import { PDFDocument } from 'pdf-lib';

const preparePDF: (
  sheet: CharacterSheet
) => Promise<Uint8Array<ArrayBufferLike>> = async (sheet) => {
  const url = 'https://fichasdenimb.com.br/sheet.pdf';
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  console.log(sheet);

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

  nameField.setText(sheet.nome);
  raceField.setText(sheet.raca.name);
  originField.setText(sheet.origin?.name || '');
  classField.setText(sheet.classe.name);
  deytiField.setText(sheet.devoto?.divindade.name || '');
  forceField.setText(sheet.atributos.Força.mod.toString());
  dexterityField.setText(sheet.atributos.Destreza.mod.toString());
  constitutionField.setText(sheet.atributos.Constituição.mod.toString());
  intelligenceField.setText(sheet.atributos.Inteligência.mod.toString());
  wisdomField.setText(sheet.atributos.Sabedoria.mod.toString());
  charismaField.setText(sheet.atributos.Carisma.mod.toString());

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
    ? sheet.atributos[fightSkill.modAttr].mod
    : 0;
  const fightBonus =
    (fightSkill?.halfLevel ?? 0) +
    fightAttrBonus +
    (fightSkill?.others ?? 0) +
    (fightSkill?.training ?? 0);

  const rangeAttrBonus = rangeSkill?.modAttr
    ? sheet.atributos[rangeSkill.modAttr].mod
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

  const defenseBonus = sheet.defesa;
  modDefense.select('modDes');
  defenseField.setText(`${defenseBonus}`);

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

export default preparePDF;
