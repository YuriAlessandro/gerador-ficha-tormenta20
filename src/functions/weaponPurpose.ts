import Equipment, {
  DamageAttribute,
  WeaponAction,
} from '../interfaces/Equipment';

/**
 * Camada de AUTORIA do propósito de uma arma — "corpo a corpo", "arremesso" ou
 * "disparo", os três propósitos do livro (JDA, cap. 3, "Propósito").
 *
 * Existe porque o motor NÃO guarda esse conceito: "ser à distância" é derivado
 * de `alcance` + `arremesso` por `isWeaponMelee`, `getWeaponSkill`,
 * `isFiringWeapon` e `weaponMatchesScope`. Um autor não tem como adivinhar essa
 * combinação, então as três telas de autoria (item personalizado da Mochila,
 * editor de item da Mochila e Pacote de Itens homebrew) oferecem o propósito e
 * gravam o triple por aqui.
 *
 * Este módulo é uma PROJEÇÃO, não uma fonte nova de verdade: `getWeaponPurpose`
 * espelha os predicados do motor e `buildWeaponPurposeFields` escreve
 * exatamente o que o catálogo oficial escreve. Nenhum predicado precisou mudar.
 */
export type WeaponPurpose = 'melee' | 'thrown' | 'firing';

export type WeaponReach = 'Curto' | 'Médio' | 'Longo';

/**
 * Alcances do livro, com a distância entre parênteses só no rótulo — o valor
 * gravado em `Equipment.alcance` continua sendo a palavra sozinha, como no
 * catálogo.
 */
export const WEAPON_REACH_OPTIONS: { value: WeaponReach; label: string }[] = [
  { value: 'Curto', label: 'Curto (9m)' },
  { value: 'Médio', label: 'Médio (30m)' },
  { value: 'Longo', label: 'Longo (90m)' },
];

export const WEAPON_PURPOSE_OPTIONS: {
  value: WeaponPurpose;
  label: string;
  hint: string;
}[] = [
  {
    value: 'melee',
    label: 'Corpo a corpo',
    hint: 'Rola Luta e soma Força ao dano.',
  },
  {
    value: 'thrown',
    label: 'Arremesso',
    hint: 'A própria arma é atirada. Rola Pontaria e soma Força ao dano; também pode ser usada corpo a corpo.',
  },
  {
    value: 'firing',
    label: 'Disparo',
    hint: 'Dispara um projétil. Rola Pontaria, não soma atributo ao dano e consome munição.',
  },
];

/** Valor gravado em `alcance` para arma sem alcance. Convenção do catálogo. */
export const NO_REACH = '-';

const REACH_BY_NORMALIZED: Record<string, WeaponReach> = {
  curto: 'Curto',
  medio: 'Médio',
  longo: 'Longo',
  // Distâncias do livro, para quem digitou o número no campo de texto livre que
  // o editor de homebrew oferecia antes deste módulo existir.
  '9m': 'Curto',
  '30m': 'Médio',
  '90m': 'Longo',
};

/**
 * Propósito de uma arma, lido dos campos que o motor de fato usa.
 *
 * `arremesso` é o discriminador: uma arma de arremesso tem alcance real E é
 * corpo a corpo ao mesmo tempo (Adaga, Azagaia), então precisa ser testada
 * antes do alcance. Espelha `isWeaponMelee`/`isFiringWeapon` — se algum dia
 * aqueles mudarem, este leitor muda junto.
 */
export function getWeaponPurpose(
  weapon: Pick<Equipment, 'alcance' | 'arremesso'>
): WeaponPurpose {
  if (weapon.arremesso) return 'thrown';
  const { alcance } = weapon;
  return alcance && alcance !== NO_REACH ? 'firing' : 'melee';
}

/**
 * Converte um alcance escrito à mão para a forma canônica.
 *
 * Devolve `undefined` para string que não dá para reconhecer (ex.: 'Curto/Médio'
 * de um pacote homebrew antigo). Isso é deliberado e diferente de `'-'`: quem
 * chama precisa distinguir "o autor disse que não tem alcance" de "o autor
 * escreveu algo que não sabemos ler", porque o segundo caso deve ser PRESERVADO
 * em vez de reescrito.
 */
export function normalizeReach(
  raw: string | undefined
): WeaponReach | typeof NO_REACH | undefined {
  if (raw === undefined) return undefined;

  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed === NO_REACH) return NO_REACH;

  // Tira acentos e o que vier entre parênteses, para aceitar tanto o rótulo
  // exibido ('Curto (9m)') quanto o que o autor digitou ('MEDIO', 'médio').
  const key = trimmed
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');

  return REACH_BY_NORMALIZED[key];
}

/**
 * Alcance canônico de uma arma, para preencher o seletor. Cai em 'Curto' quando
 * não dá para reconhecer: é o menor alcance do livro, então é o palpite que
 * menos infla a arma se o autor não corrigir.
 */
export function getWeaponReach(
  weapon: Pick<Equipment, 'alcance'>
): WeaponReach {
  const normalized = normalizeReach(weapon.alcance);
  return normalized && normalized !== NO_REACH ? normalized : 'Curto';
}

/**
 * Par de modos de ataque de uma arma de arremesso.
 *
 * Cópia literal da convenção do catálogo (`Armas.ADAGA`, `Armas.LANCA`,
 * `Armas.MACHADINHA`): sem `specialActions` a arma só seria classificada, e o
 * seletor "Como atacar com X?" nunca apareceria. O `damageAttribute` explícito
 * no modo `arremessar` é obrigatório — sem ele `resolveDamageAttribute`
 * devolveria 'Nenhum' na perícia Pontaria e a arma arremessada perderia o dano
 * de atributo que a regra manda somar.
 */
function buildThrownActions(damageAttribute?: DamageAttribute): WeaponAction[] {
  return [
    { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
    {
      id: 'arremessar',
      label: 'Arremessar',
      skill: 'Pontaria',
      damageAttribute: damageAttribute ?? 'Força',
    },
  ];
}

/**
 * Escritor único do triple `alcance`/`arremesso`/`specialActions`. As três telas
 * de autoria chamam esta função em vez de montar os campos à mão.
 *
 * `alcance` sai SEMPRE preenchido, inclusive `'-'` para corpo a corpo. Campo
 * ausente e campo `'-'` são coisas diferentes: o primeiro é item antigo, de
 * antes deste controle existir, e é o que `refreshBagItemsFromCatalog` tem
 * permissão de curar pelo catálogo; o segundo é escolha explícita do autor e é
 * intocável.
 */
export function buildWeaponPurposeFields(
  purpose: WeaponPurpose,
  reach: WeaponReach,
  damageAttribute?: DamageAttribute
): {
  alcance: string;
  arremesso?: boolean;
  specialActions?: WeaponAction[];
} {
  if (purpose === 'melee') {
    return {
      alcance: NO_REACH,
      arremesso: undefined,
      specialActions: undefined,
    };
  }

  if (purpose === 'thrown') {
    return {
      alcance: reach,
      arremesso: true,
      specialActions: buildThrownActions(damageAttribute),
    };
  }

  return { alcance: reach, arremesso: undefined, specialActions: undefined };
}
