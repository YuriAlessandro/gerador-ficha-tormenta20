import CharacterSheet from '../../interfaces/CharacterSheet';
import { getClassLevel } from '../multiclass';

/**
 * Tabela oficial de dano desarmado da Briga (Lutador/Atleta), por nível de
 * classe: 1º-4º 1d6, 5º-8º 1d8, 9º-12º 1d10, 13º-16º 1d12, 17º-19º 2d8,
 * 20º 2d10 (Dono da Rua / Corpo Ideal).
 */
export function getBrigaDice(classLevel: number): string {
  if (classLevel >= 20) return '2d10';
  if (classLevel >= 17) return '2d8';
  if (classLevel >= 13) return '1d12';
  if (classLevel >= 9) return '1d10';
  if (classLevel >= 5) return '1d8';
  return '1d6';
}

/**
 * Ajusta o roll de dano da habilidade Briga em `sheet.classe.abilities` para
 * o dado correspondente ao nível na classe que concede a habilidade
 * (multiclasse usa o nível de classe, não o nível do personagem). Substitui
 * os objetos da habilidade em vez de mutá-los, preservando
 * `classe.originalAbilities`.
 *
 * Retorna o novo dado quando houve mudança, ou null caso contrário.
 */
export function updateBrigaRolls(sheet: CharacterSheet): string | null {
  let changedDice: string | null = null;

  sheet.classe.abilities = sheet.classe.abilities.map((ability) => {
    if (ability.name !== 'Briga' || !ability.rolls?.length) return ability;

    const className = ability.sourceClassName ?? sheet.classe.name;
    const dice = getBrigaDice(getClassLevel(sheet, className));

    if (ability.rolls.every((roll) => roll.dice === dice)) return ability;

    changedDice = dice;
    return {
      ...ability,
      rolls: ability.rolls.map((roll) => ({ ...roll, dice })),
    };
  });

  return changedDice;
}
