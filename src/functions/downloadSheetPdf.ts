import { Atributo } from '@/data/systems/tormenta20/atributos';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Equipment from '@/interfaces/Equipment';
import Skill, { CompleteSkill } from '@/interfaces/Skills';
import { Spell } from '@/interfaces/Spells';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { calculateCurrencySpaces } from './general';
import { isMulticlass, getMulticlassDisplayName } from './multiclass';
import {
  getWeaponAttackSkillBonus,
  getWeaponDisplayDamage,
} from './weaponSkill';
import {
  getSheetProficiencias,
  getWeaponNonProficiencyPenalty,
} from './proficiencies';
import { collectSheetPowers } from './powers/collectSheetPowers';
import { serializeJournalForPdf } from './playerJournal';
import { getPowerDisplayName, getPowerDisplayText } from './powers/powerText';
import {
  getDerivedSpellCircle,
  hasDerivedSpellAccess,
} from './spells/derivedSpells';
import { getItemDisplayName } from './equipmentDisplay';
import {
  appendExtraPages,
  PdfSection,
  splitToFit,
} from './pdf/sheetExtraPages';
import { getOrderedItemsByGroup } from '../components/SheetResult/BackpackModal/bagOrdering';
import { getItemSpaces } from '../interfaces/Bag';

const CP1252_REPLACEMENTS: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
  '–': '-',
  '—': '-',
  '…': '...',
  '•': '*',
  ' ': ' ',
};

const sanitizeForWinAnsi = (text: string | undefined | null): string => {
  if (!text) return '';
  let out = text;
  Object.entries(CP1252_REPLACEMENTS).forEach(([from, to]) => {
    out = out.split(from).join(to);
  });
  return Array.from(out)
    .filter((char) => (char.codePointAt(0) ?? 0) <= 0xff)
    .join('');
};

/**
 * Quanto texto cabe em cada um dos dois campos de inventário do template.
 * Era o mesmo 1000 de antes, mas agora quebrando em fronteira de linha.
 */
const EQUIPMENT_FIELD_CHARS = 1000;

/**
 * Retângulo útil dos dois campos-despejo de página inteira do template
 * (`Historico`, na página 2, e `Atualização`, na 3).
 */
const DUMP_FIELD_WIDTH = 499;
const DUMP_FIELD_HEIGHT = 671;

/**
 * Corta `text` no último `\n` que ainda cabe em `maxChars`, para o campo nunca
 * terminar no meio de uma palavra. Uma linha sozinha maior que o limite é
 * cortada na marra — senão não haveria progresso.
 */
const takeLines = (
  text: string,
  maxChars: number
): { fitted: string; remainder: string } => {
  if (text.length <= maxChars) return { fitted: text, remainder: '' };
  const slice = text.slice(0, maxChars);
  const cut = slice.lastIndexOf('\n');
  if (cut <= 0) {
    return { fitted: slice, remainder: text.slice(maxChars) };
  }
  return { fitted: text.slice(0, cut), remainder: text.slice(cut + 1) };
};

/**
 * As opções reais do dropdown são `for`/`des`/…, mas a ficha inteira (perícias
 * inclusive) grava `modFor`/`modDes`/… desde sempre — o campo é editável, então
 * o valor livre passa. Mantido por consistência com as 30 linhas de perícia.
 */
const ATTRIBUTE_TO_FIELD: Record<Atributo, string> = {
  [Atributo.FORCA]: 'modFor',
  [Atributo.DESTREZA]: 'modDes',
  [Atributo.CONSTITUICAO]: 'modCon',
  [Atributo.INTELIGENCIA]: 'modInt',
  [Atributo.SABEDORIA]: 'modSab',
  [Atributo.CARISMA]: 'modCar',
};

/**
 * Atributo que entra na Defesa, espelhando `recalculateSheet` (Nobre usa
 * Carisma; armadura pesada anula o atributo; o usuário pode trocar ou desligar).
 * Com armadura pesada ou atributo desligado não há atributo — cai em Destreza
 * só para o dropdown não ficar num estado inválido.
 */
const getDefenseAttribute = (sheet: CharacterSheet): Atributo => {
  const wornArmor = sheet.wornArmorId
    ? sheet.bag.getEquipments().Armadura.find((a) => a.id === sheet.wornArmorId)
    : undefined;
  const defaultAttr =
    sheet.classe.name === 'Nobre' ? Atributo.CARISMA : Atributo.DESTREZA;
  if (wornArmor?.isHeavyArmor) return defaultAttr;
  if (sheet.useDefenseAttribute === false) return defaultAttr;
  return sheet.customDefenseAttribute || defaultAttr;
};

interface OverflowText {
  powers: string;
  spells: string;
  equipment: string;
  extraOficios: CompleteSkill[];
}

/**
 * Monta as seções das páginas de continuação: o que não tem campo no template
 * mais o que transbordou dos campos de tamanho fixo.
 *
 * Cada seção só existe se tiver conteúdo — uma ficha comum tem que continuar
 * saindo com exatamente as três páginas do template.
 */
const buildExtraSections = (
  sheet: CharacterSheet,
  overflow: OverflowText
): PdfSection[] => {
  const sections: PdfSection[] = [];
  const push = (title: string, body: string) => {
    if (body.trim()) sections.push({ title, body: sanitizeForWinAnsi(body) });
  };

  // Diário do Jogador. As anotações livres só saem quando NÃO há diário: uma
  // ficha migrada mantém `sheet.notes` em disco como rede de segurança, e
  // imprimir os dois duplicaria o mesmo texto no PDF.
  const journalText = serializeJournalForPdf(sheet.journal, sheet.nome);
  if (journalText) {
    push('Diário do Jogador', journalText);
  } else {
    push('Anotações', sheet.notes ?? '');
  }

  const rd = sheet.reducaoDeDano;
  if (rd) {
    push(
      'Redução de Dano',
      Object.entries(rd)
        .filter(([, value]) => !!value)
        .map(([type, value]) => `- ${type}: ${value}`)
        .join('\n')
    );
  }

  if (sheet.complication) {
    const { name, description, behavioral } = sheet.complication;
    push(
      'Complicação',
      `${name}${behavioral ? ' (comportamental)' : ''}\n${description}`
    );
  }

  if (sheet.age) {
    const years = sheet.age.years ? `, ${sheet.age.years} anos` : '';
    const complications = sheet.age.complications
      .map((comp) => `- ${comp.name}: ${comp.description}`)
      .join('\n');
    push('Idade', `${sheet.age.bracket}${years}\n${complications}`.trimEnd());
  }

  if (sheet.poderesCapturados?.length) {
    push(
      'Poderes Capturados',
      sheet.poderesCapturados
        .map(
          (choice) =>
            `- ${choice.poder} (${choice.divindade}) — ${choice.level}º nível`
        )
        .join('\n')
    );
  }

  const companionLines = [
    ...(sheet.companions ?? []).map(
      (companion) =>
        `- ${companion.name || 'Melhor Amigo'} (${companion.companionType}, ${
          companion.size
        }) — PV ${companion.pv}`
    ),
    ...(sheet.animalCompanions ?? []).map(
      (companion) =>
        `- ${companion.name}${
          companion.species ? ` (${companion.species})` : ''
        } — ${companion.archetype}`
    ),
  ];
  push('Companheiros', companionLines.join('\n'));

  // O template tem campo para T$ e TO, mas não para TC.
  if (sheet.dinheiroTC)
    push('Moedas', `Tibar de Cobre (TC): ${sheet.dinheiroTC}`);

  if (overflow.extraOficios.length > 0) {
    push(
      'Ofícios (continuação)',
      overflow.extraOficios
        .map((skill) => `- ${skill.name}: treino ${skill.training ?? 0}`)
        .join('\n')
    );
  }

  push('Poderes (continuação)', overflow.powers);
  push('Magias (continuação)', overflow.spells);
  push('Equipamentos (continuação)', overflow.equipment);

  return sections;
};

const getCircleLabel = (circle: string): string => {
  const match = circle.match(/(\d)º/);
  return match ? `${match[1]}º` : '';
};

const getSpellPmCost = (spell: Spell): number => {
  const base = spell.manaExpense ?? manaExpenseByCircle[spell.spellCircle] ?? 0;
  const reduction = spell.manaReduction ?? 0;
  return Math.max(0, base - reduction);
};

const generateSpellText = (spell: Spell): string => {
  const meta = [
    getCircleLabel(spell.spellCircle),
    spell.school,
    spell.execucao,
    spell.alcance,
    spell.duracao,
    `${getSpellPmCost(spell)}PM`,
  ].join(', ');
  return `- ${spell.nome} (${meta}): ${spell.description}`;
};

/**
 * Preenche o template com os dados da ficha.
 *
 * Recebe os bytes do template em vez de buscá-los: o `fetch` depende de
 * `import.meta.env` e de um servidor, o que deixaria esta função inteira sem
 * cobertura de teste. `preparePDF` (no fim do arquivo) é quem faz o fetch.
 */
export const fillSheetPdf: (
  templateBytes: ArrayBuffer | Uint8Array,
  sheet: CharacterSheet
) => Promise<Uint8Array<ArrayBufferLike>> = async (templateBytes, sheet) => {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  // Mesma fonte dos campos do template (base WinAnsi), para medir o quanto de
  // texto cabe em cada campo antes de mandar o resto para a continuação.
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get all fields in the PDF
  const nameField = form.getTextField('Nome');
  const raceField = form.getTextField('Raca');
  const originField = form.getTextField('Origem');
  const classField = form.getTextField('Classe');
  const levelField = form.getTextField('nivel');
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
  const otherDefenseField = form.getTextField('defesaOutros');
  const displacimentField = form.getTextField('deslocamento');
  const proficienciesField = form.getTextField('caracteristicas');
  const halfLevelField = form.getTextField('metadeDoNivel');

  const moneyField = form.getTextField('T$');
  const goldMoneyField = form.getTextField('TO');
  const armorPenaltyField = form.getTextField('penalidadeDeArmadura');
  const heavyArmorField = form.getCheckBox('checkPesada');
  // Dropdown, não campo de texto: as opções são os próprios nomes de tamanho.
  const sizeModifierField = form.getDropdown('modTamanho');
  const stealthSizeField = form.getTextField('tFurtividade');
  const maneuverSizeField = form.getTextField('manobras');

  const equipamentsFirstField = form.getTextField('item1');
  const equipamentsSecondField = form.getTextField('item2');
  const currentCargoField = form.getTextField('cargaAtual');
  const maxCargoField = form.getTextField('cargaMaxima');
  const carryCapacityField = form.getTextField('levantar');

  const powersField = form.getTextField('Historico');
  const spellsField = form.getTextField('Atualização');

  const craftSkillFirstField = form.getTextField('Texto8');
  const craftSkillSecondField = form.getTextField('Texto9');

  nameField.setText(sanitizeForWinAnsi(sheet.nome));
  raceField.setText(sanitizeForWinAnsi(sheet.raca.name));
  originField.setText(sanitizeForWinAnsi(sheet.origin?.name));
  let classDisplay: string;
  if (isMulticlass(sheet)) {
    classDisplay = getMulticlassDisplayName(sheet);
  } else if (sheet.classe.isVariant && sheet.classe.baseClassName) {
    classDisplay = `${sheet.classe.name} (${sheet.classe.baseClassName}) ${sheet.nivel}`;
  } else {
    classDisplay = `${sheet.classe.name} ${sheet.nivel}`;
  }
  classField.setText(sanitizeForWinAnsi(classDisplay));
  // O nível também vive dentro da string de `Classe` (é o formato do template
  // impresso), mas o campo próprio existe e ficava vazio.
  levelField.setText(sheet.nivel.toString());
  deytiField.setText(sanitizeForWinAnsi(sheet.devoto?.divindade.name));
  forceField.setText(sheet.atributos.Força.value.toString());
  dexterityField.setText(sheet.atributos.Destreza.value.toString());
  constitutionField.setText(sheet.atributos.Constituição.value.toString());
  intelligenceField.setText(sheet.atributos.Inteligência.value.toString());
  wisdomField.setText(sheet.atributos.Sabedoria.value.toString());
  charismaField.setText(sheet.atributos.Carisma.value.toString());
  let displacementText = sheet.displacement.toString();
  // Prefere os deslocamentos derivados (manual + bônus de efeitos, ex.: o voo
  // da Forma Sorrateira Superior); cai no manual quando não há bônus ativo.
  const movementTypes = sheet.computedMovementTypes ?? sheet.movementTypes;
  if (movementTypes) {
    const parts: string[] = [];
    if (movementTypes.escalada && movementTypes.escalada > 0)
      parts.push(`Esc ${movementTypes.escalada}m`);
    if (movementTypes.escavar && movementTypes.escavar > 0)
      parts.push(`Exc ${movementTypes.escavar}m`);
    if (movementTypes.natacao && movementTypes.natacao > 0)
      parts.push(`Nat ${movementTypes.natacao}m`);
    if (movementTypes.voo && movementTypes.voo > 0) {
      const hover = movementTypes.pairar ? ' P' : '';
      parts.push(`Voo ${movementTypes.voo}m${hover}`);
    }
    if (parts.length > 0) {
      displacementText += ` (${parts.join(', ')})`;
    }
  }
  displacimentField.setText(sanitizeForWinAnsi(displacementText));
  halfLevelField.setText(Math.floor(sheet.nivel / 2).toString());

  pvMaxField.setText(sheet.pv.toString());
  pmMaxField.setText(sheet.pm.toString());

  // Add sheet equipaments
  const MAX_WEAPON_FIELDS = 5;
  const MAX_DEFENSE_FIELDS = 2;

  const bagEquipaments = sheet.bag.getEquipments();
  // Weapons in the PDF: wielded ones first (so the active weapon is always
  // visible even when the player owns more than 5), then the rest in the
  // user-defined manual order.
  const allWeapons = getOrderedItemsByGroup(
    sheet.bag,
    (it) => it.group === 'Arma'
  );
  const wieldedWeapons = allWeapons.filter(
    (w) =>
      w.id !== undefined &&
      (w.id === sheet.mainHandItemId || w.id === sheet.offHandItemId)
  );
  const restWeapons = allWeapons.filter((w) => !wieldedWeapons.includes(w));
  const weapons = [...wieldedWeapons, ...restWeapons].slice(
    0,
    MAX_WEAPON_FIELDS
  );

  const effectiveProficiencias = getSheetProficiencias(sheet);

  weapons.forEach((weapon, index) => {
    const weaponNameField = form.getTextField(`ataque${index + 1}`);
    const weaponBonusField = form.getTextField(`tAtak${index + 1}`);
    const weaponDamageField = form.getTextField(`dano${index + 1}`);
    const weaponCritField = form.getTextField(`critico${index + 1}`);
    const weaponTypeField = form.getTextField(`tipo${index + 1}`);
    const weaponRangeField = form.getTextField(`alcance${index + 1}`);

    const weaponName = getItemDisplayName(weapon);
    const weaponNameDisplay = weapon.customSkill
      ? `${weaponName} (${weapon.customSkill})`
      : weaponName;
    weaponNameField.setText(sanitizeForWinAnsi(weaponNameDisplay));
    weaponDamageField.setText(
      sanitizeForWinAnsi(getWeaponDisplayDamage(weapon, sheet.atributos))
    );
    weaponCritField.setText(sanitizeForWinAnsi(weapon.critico));
    weaponTypeField.setText(sanitizeForWinAnsi(weapon.tipo));
    weaponRangeField.setText(sanitizeForWinAnsi(weapon.alcance));

    const modAtk = getWeaponAttackSkillBonus(
      weapon,
      sheet.completeSkills,
      sheet.atributos
    );
    const atk =
      (weapon.atkBonus ? weapon.atkBonus + modAtk : modAtk) +
      getWeaponNonProficiencyPenalty(weapon, effectiveProficiencias);
    weaponBonusField.setText(`${atk >= 0 ? '+' : ''}${atk}`);
  });

  // Prioritize the worn armor and the wielded shield(s) in the fixed PDF
  // slots. Other armors/shields owned but not active fall to the inventory
  // list below.
  const allArmors = bagEquipaments.Armadura;
  const allShields = bagEquipaments.Escudo;
  let resolvedWornArmor = sheet.wornArmorId
    ? allArmors.find((a) => a.id === sheet.wornArmorId)
    : undefined;
  if (!resolvedWornArmor && !sheet.wornArmorId && allArmors.length === 1) {
    [resolvedWornArmor] = allArmors;
  }
  const wieldedShields = allShields.filter(
    (s) =>
      s.id !== undefined &&
      (s.id === sheet.mainHandItemId || s.id === sheet.offHandItemId)
  );
  // Fallback: if neither hand has a shield assigned but exactly 1 shield
  // exists, treat it as wielded for PDF purposes (legacy compat).
  const effectiveShields =
    wieldedShields.length === 0 &&
    !sheet.mainHandItemId &&
    !sheet.offHandItemId &&
    allShields.length === 1
      ? allShields
      : wieldedShields;
  const prioritizedDefense: (typeof allArmors)[number][] = [];
  if (resolvedWornArmor) prioritizedDefense.push(resolvedWornArmor);
  prioritizedDefense.push(...effectiveShields);
  // Top up with any leftover defense equipment so we don't leave PDF slots
  // empty when neither armor nor shield is "active". Leftovers come in the
  // user-defined manual order.
  if (prioritizedDefense.length < MAX_DEFENSE_FIELDS) {
    const leftoverOrdered = getOrderedItemsByGroup(
      sheet.bag,
      (it) => it.group === 'Armadura' || it.group === 'Escudo'
    ).filter(
      (eq) =>
        !prioritizedDefense.some((p) => p.id === eq.id && eq.id !== undefined)
    );
    prioritizedDefense.push(
      ...(leftoverOrdered.slice(
        0,
        MAX_DEFENSE_FIELDS - prioritizedDefense.length
      ) as typeof prioritizedDefense)
    );
  }
  const defenseEquipments = prioritizedDefense.slice(0, MAX_DEFENSE_FIELDS);
  defenseEquipments.forEach((defense, index) => {
    const defenseNameField = form.getTextField(`armadura${index + 1}`);
    const defenseBonusField = form.getTextField(`defesa${index + 1}`);
    const penaltyField = form.getTextField(`penalidade${index + 1}`);

    defenseNameField.setText(sanitizeForWinAnsi(getItemDisplayName(defense)));
    defenseBonusField.setText(
      `${defense.defenseBonus >= 0 ? '+' : ''}${defense.defenseBonus}`
    );
    penaltyField.setText(
      `${defense.armorPenalty >= 0 ? '+' : ''}${defense.armorPenalty}`
    );
  });

  // Add remain equipments — respects the user-defined manual order so the
  // text inventory mirrors what the player sees in the Mochila.
  const equipsEntriesNoWeapons: Equipment[] = getOrderedItemsByGroup(
    sheet.bag,
    (it) =>
      it.group !== 'Arma' && it.group !== 'Armadura' && it.group !== 'Escudo'
  );

  // Sufixo de espaços. `0` é um valor válido (item que o jogador zerou de
  // propósito) — o que suprime o sufixo é o espaço ausente, não o espaço zero.
  const spacesSuffix = (equip: Equipment): string => {
    if (equip.spaces === undefined && !equip.isAmmo) return '';
    return ` (${getItemSpaces(equip)} espaços)`;
  };

  // Concanenate all equipments names into one string
  const equipmentsNames = equipsEntriesNoWeapons
    .map(
      (equip) =>
        `${
          equip.quantity && equip.quantity > 1 ? `${equip.quantity}x ` : ''
        }${getItemDisplayName(equip)}${spacesSuffix(equip)}`
    )
    .join('\n');

  const allWeaponsForList = getOrderedItemsByGroup(
    sheet.bag,
    (it) => it.group === 'Arma'
  );
  const allDefenseEquipments = getOrderedItemsByGroup(
    sheet.bag,
    (it) => it.group === 'Armadura' || it.group === 'Escudo'
  );

  const weaponsNames = allWeaponsForList
    .map((weapon) => {
      const displayName = getItemDisplayName(weapon);
      if (weapon.isAmmo) {
        const units = weapon.unitsRemaining ?? 0;
        return `${displayName}: ${units}${spacesSuffix(weapon)}`;
      }
      return `${displayName}${spacesSuffix(weapon)}`;
    })
    .join('\n');

  const defenseNames = allDefenseEquipments
    .map((defense) => `${getItemDisplayName(defense)}${spacesSuffix(defense)}`)
    .join('\n');

  // `filter(Boolean)`: juntar incondicionalmente deixava linhas em branco no
  // meio da lista quando um dos grupos estava vazio.
  const allEquipments = [equipmentsNames, weaponsNames, defenseNames]
    .filter(Boolean)
    .join('\n');
  const sanitizedEquipments = sanitizeForWinAnsi(allEquipments);
  // O corte antigo era `slice(0,1000)` / `slice(1000,2000)`: partia palavra ao
  // meio e jogava fora, sem nenhum aviso, tudo que passasse de 2000 caracteres.
  // Agora quebra em fronteira de linha e o resto vai para a continuação.
  const firstChunk = takeLines(sanitizedEquipments, EQUIPMENT_FIELD_CHARS);
  const secondChunk = takeLines(firstChunk.remainder, EQUIPMENT_FIELD_CHARS);
  equipamentsFirstField.setText(firstChunk.fitted);
  equipamentsSecondField.setText(secondChunk.fitted);
  const equipmentOverflow = secondChunk.remainder;

  // Add equipment current cargo (including currency weight)
  const currencySpaces = calculateCurrencySpaces(
    sheet.dinheiro,
    sheet.dinheiroTC,
    sheet.dinheiroTO
  );
  const currentCargo = sheet.bag.getSpaces() + currencySpaces;
  currentCargoField.setText(`${currentCargo}`);
  const maxCargo = sheet.maxSpaces;
  maxCargoField.setText(`${maxCargo}`);
  carryCapacityField.setText(`${maxCargo * 2}`);

  // O template tem campo para T$ e TO; TC não tem casa e sai na continuação.
  if (sheet.dinheiro) moneyField.setText(`${sheet.dinheiro}`);
  if (sheet.dinheiroTO) goldMoneyField.setText(`${sheet.dinheiroTO}`);

  // Penalidade de armadura: só o que está VESTIDO/EMPUNHADO conta —
  // `getArmorPenalty()` somaria toda armadura carregada na mochila.
  const activeArmorPenalty =
    sheet.bag.getActiveArmorPenalty(
      sheet.wornArmorId,
      sheet.mainHandItemId,
      sheet.offHandItemId
    ) + (sheet.extraArmorPenalty ?? 0);
  armorPenaltyField.setText(`${activeArmorPenalty}`);
  if (resolvedWornArmor?.isHeavyArmor) heavyArmorField.check();
  else heavyArmorField.uncheck();

  // Modificadores de tamanho (Pequeno/Grande…)
  const sizeModifiers = sheet.size?.modifiers;
  if (sizeModifiers) {
    const sizeName = sheet.size?.name;
    if (sizeName && sizeModifierField.getOptions().includes(sizeName)) {
      sizeModifierField.select(sizeName);
    }
    stealthSizeField.setText(
      `${sizeModifiers.stealth >= 0 ? '+' : ''}${sizeModifiers.stealth}`
    );
    maneuverSizeField.setText(
      `${sizeModifiers.maneuver >= 0 ? '+' : ''}${sizeModifiers.maneuver}`
    );
  }

  // Add defense bonus
  const defenseBonus = sheet.defesa;
  // O atributo de defesa era fixo em Destreza mesmo quando a ficha usava outro
  // (ex.: Carisma por Graça Divina) ou nenhum.
  modDefense.select(ATTRIBUTE_TO_FIELD[getDefenseAttribute(sheet)]);
  defenseField.setText(`${defenseBonus}`);
  if (sheet.bonusDefense) otherDefenseField.setText(`${sheet.bonusDefense}`);

  // Add powers as one big string.
  // A montagem vem de `collectSheetPowers` — o MESMO coletor da aba Poderes.
  // Antes daqui o PDF lia só seis das oito fontes e deixava de fora justamente
  // os poderes criados à mão (`customPowers`/`customGrantedPowers`).
  const { powers: uniquePowers, counts: powerCount } =
    collectSheetPowers(sheet);

  const powersText = uniquePowers
    .map((power) => {
      const count = powerCount[power.name];
      const countSuffix = count > 1 ? ` (x${count})` : '';
      return `- ${getPowerDisplayName(
        power
      )}${countSuffix}: ${getPowerDisplayText(power)}`;
    })
    .join('\n');
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
  const powersSize = powersFieldFontSize();
  // A escada de fonte acima só reduz o tamanho — quem garante que nada se perde
  // é o `splitToFit`: o que não couber no campo vai para a continuação em vez de
  // ser cortado em silêncio pelo visualizador.
  const powersSplit = splitToFit(
    sanitizeForWinAnsi(powersText),
    helvetica,
    powersSize,
    DUMP_FIELD_WIDTH,
    DUMP_FIELD_HEIGHT
  );
  powersField.setText(powersSplit.fitted);
  powersField.setFontSize(powersSize);

  // Add spells with descriptions
  const spells = sheet.spells || [];
  // Usurpar (Usurpador): o repertório é o catálogo divino inteiro até o
  // círculo acessível (~140 magias). Despejar as descrições aqui daria ~150 mil
  // caracteres num único campo AcroForm — a escala de fonte satura em 6pt e o
  // campo estoura. Sai a regra em vez da lista.
  const spellsText = hasDerivedSpellAccess(sheet)
    ? [
        `Usurpar: você pode lançar qualquer magia divina até o ${getDerivedSpellCircle(
          sheet
        )}º círculo.`,
        'Teste de Enganação (CD 15 + custo em PM da magia). Se falhar, a magia é perdida mas os PM são gastos.',
        'Não pode escolher 10 nesse teste. Sofre penalidade de armadura. -5 em local com símbolo sagrado visível.',
      ].join('\n')
    : spells
        .sort((a, b) => {
          const circleCompare = a.spellCircle.localeCompare(b.spellCircle);
          if (circleCompare !== 0) return circleCompare;
          return a.nome.localeCompare(b.nome);
        })
        .map(generateSpellText)
        .join('\n');
  const spellsFieldFontSize = (): number => {
    if (spellsText.length > 7000) return 6;
    if (spellsText.length > 5000) return 7;
    if (spellsText.length > 3000) return 8;
    return 10;
  };
  const spellsSize = spellsFieldFontSize();
  const spellsSplit = splitToFit(
    sanitizeForWinAnsi(spellsText),
    helvetica,
    spellsSize,
    DUMP_FIELD_WIDTH,
    DUMP_FIELD_HEIGHT
  );
  spellsField.setText(spellsSplit.fitted);
  spellsField.setFontSize(spellsSize);

  // Proficiencies
  const proficienciesText = effectiveProficiencias.join('\n');
  proficienciesField.setText(sanitizeForWinAnsi(proficienciesText));

  // The PDF sheet only allows 30 skills, being two max "Oficios". We need to make sure we don't exceed that.
  // If there is more than 2 "Oficios", we will remove the extra ones. If there is only one, let's create a empty one (we need always two).
  const skills =
    sheet.completeSkills?.filter((skill) => !skill.name.includes('Ofício')) ||
    [];
  const oficioSkills =
    sheet.completeSkills?.filter((skill) => skill.name.includes('Ofício')) ||
    [];
  // O template só tem duas linhas de Ofício. O 3º em diante sumia; agora vai
  // para a continuação em vez de ser descartado.
  const extraOficios = oficioSkills.slice(2);
  if (oficioSkills.length > 2) {
    oficioSkills.splice(2);
  } else {
    // The PDF reserves two "Ofício" rows. Pad with empty ones until there are
    // exactly two, otherwise the alphabetical positional mapping shifts every
    // skill after the "Ofício" rows (Percepção onward) up to the wrong row.
    while (oficioSkills.length < 2) {
      oficioSkills.push({
        training: 0,
        others: 0,
        halfLevel: 0,
        modAttr: Atributo.INTELIGENCIA,
        countAsTormentaPower: false,
        name: Skill.OFICIO,
      });
    }
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

      // Furtividade leva o modificador de tamanho, como no SkillTable — sem
      // isso o total de um personagem Pequeno saía errado no PDF.
      const sizeModifier =
        skill.name === 'Furtividade' ? sheet.size?.modifiers?.stealth ?? 0 : 0;

      const skillTotal =
        (skill.halfLevel ?? 0) +
        (attrValue ?? 0) +
        (skill.others ?? 0) +
        (skill.training ?? 0) +
        sizeModifier;

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
        // There are two "Oficio" name fields in the PDF. After sorting, the two
        // "Ofício" skills land at indices 21 and 22 (right after Nobreza), and the
        // first name field maps to the first Ofício row, the second to the next.
        if (oficioText) {
          const oficioField =
            index === 21 ? craftSkillFirstField : craftSkillSecondField;
          oficioField.setText(
            sanitizeForWinAnsi(oficioText.replace('(', '').replace(')', ''))
          );
        }
      }
    });

  // Tudo que o template não comporta: os campos órfãos do AcroForm (Anotações),
  // os dados que nunca tiveram campo (RD, complicação, companheiros…) e o que
  // transbordou dos campos de tamanho fixo.
  await appendExtraPages(
    pdfDoc,
    buildExtraSections(sheet, {
      powers: powersSplit.remainder,
      spells: spellsSplit.remainder,
      equipment: equipmentOverflow,
      extraOficios,
    })
  );

  pdfDoc.setTitle(`Ficha de ${sheet.nome}`);
  pdfDoc.setAuthor('Fichas de Nimb');
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

/** Busca o template e delega o preenchimento para `fillSheetPdf`. */
const preparePDF: (
  sheet: CharacterSheet
) => Promise<Uint8Array<ArrayBufferLike>> = async (sheet) => {
  const url = `${import.meta.env.BASE_URL}sheet.pdf`;
  const templateBytes = await fetch(url).then((res) => res.arrayBuffer());
  return fillSheetPdf(templateBytes, sheet);
};

export default preparePDF;
