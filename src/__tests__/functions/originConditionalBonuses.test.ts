/**
 * Bônus condicionais de poderes de origem (Legionário / Desertor da Supremacia).
 *
 * Ambos concedem bônus apenas enquanto o personagem empunha um par específico
 * de itens. Os testes cobrem os dois sentidos da condição (empunhando x não
 * empunhando) e a empunhadura automática feita na geração/carga da ficha.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import { AMEACAS_ARTON_WEAPONS } from '../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import { Armas, Escudos } from '../../data/systems/tormenta20/equipamentos';
import Equipment from '../../interfaces/Equipment';
import { OriginPower } from '../../interfaces/Poderes';

type Opts = {
  power?: OriginPower;
  originName?: string;
  weapon: Equipment;
  wielded: boolean;
};

const buildSheet = ({ power, originName, weapon, wielded }: Opts) => {
  const classes = dataRegistry.getClassesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const races = dataRegistry.getRacesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const guerreiro = classes.find((c) => c.name === 'Guerreiro')!;
  const humano = races.find((r) => r.name === 'Humano')!;

  const attributes: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 0 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  const bag = new Bag({
    Arma: [_.cloneDeep(weapon)],
    Escudo: [_.cloneDeep(Escudos.ESCUDO_PESADO)],
  } as never);
  const eq = bag.getEquipments();

  return {
    id: 'test-origin-cond',
    nome: 'Test',
    sexo: 'Masculino',
    nivel: 1,
    atributos: attributes,
    raca: humano,
    classe: guerreiro,
    skills: [],
    pv: 20,
    pm: 3,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag,
    devoto: undefined,
    origin: power
      ? { name: originName ?? 'Origem', powers: [power] }
      : undefined,
    spells: [],
    displacement: 9,
    size: humano.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
    // `equipStateMigrated: true` impede a auto-empunhadura, permitindo testar
    // explicitamente o caso "nada empunhado".
    equipStateMigrated: true,
    mainHandItemId: wielded ? eq.Arma[0].id : undefined,
    offHandItemId: wielded ? eq.Escudo[0].id : undefined,
  } as unknown as CharacterSheet;
};

const gladioOf = (s: CharacterSheet) =>
  (s.bag.equipments.Arma || []).find((w) => w.nome === 'Gládio');

describe('Legionário - bônus condicional (gládio + escudo pesado)', () => {
  const legionario = atlasOriginPowers.LEGIONARIO;
  const originName = 'Legionário (Império de Tauron)';
  const gladio = AMEACAS_ARTON_WEAPONS.GLADIO;

  it('aplica +1 Defesa e +1 margem de ameaça ao empunhar gládio + escudo pesado', () => {
    const withPower = recalculateSheet(
      buildSheet({
        power: legionario,
        originName,
        weapon: gladio,
        wielded: true,
      })
    );
    const withoutPower = recalculateSheet(
      buildSheet({ weapon: gladio, wielded: true })
    );

    expect(withPower.defesa).toBe(withoutPower.defesa + 1);
    expect(gladioOf(withPower)?.critico).toBe('18/x3');
    expect(gladioOf(withoutPower)?.critico).toBe('19/x3');
  });

  it('não aplica nenhum bônus quando nada está empunhado', () => {
    const withPower = recalculateSheet(
      buildSheet({
        power: legionario,
        originName,
        weapon: gladio,
        wielded: false,
      })
    );
    const withoutPower = recalculateSheet(
      buildSheet({ weapon: gladio, wielded: false })
    );

    expect(withPower.defesa).toBe(withoutPower.defesa);
    expect(gladioOf(withPower)?.critico).toBe('19/x3');
  });

  it('a empunhadura automática (ficha não migrada) ativa os bônus', () => {
    const sheet = buildSheet({
      power: legionario,
      originName,
      weapon: gladio,
      wielded: false,
    });
    // Simula ficha recém-gerada / legada: sem slots e sem flag de migração.
    delete (sheet as { equipStateMigrated?: boolean }).equipStateMigrated;

    const r = recalculateSheet(sheet);
    expect(r.mainHandItemId).toBeDefined();
    expect(r.offHandItemId).toBeDefined();
    expect(gladioOf(r)?.critico).toBe('18/x3');
  });
});

describe('Desertor da Supremacia - bônus condicional (espada bastarda + escudo pesado)', () => {
  const desertor = atlasOriginPowers.DESERTOR_DA_SUPREMACIA;
  const bastarda = Armas.ESPADA_BASTARDA;

  const atkOf = (s: CharacterSheet) =>
    (s.bag.equipments.Arma || []).find((w) => w.nome === 'Espada Bastarda')
      ?.atkBonus ?? 0;

  it('aplica +2 de ataque ao empunhar espada bastarda + escudo pesado', () => {
    const withPower = recalculateSheet(
      buildSheet({
        power: desertor,
        originName: 'Desertor da Supremacia',
        weapon: bastarda,
        wielded: true,
      })
    );
    const withoutPower = recalculateSheet(
      buildSheet({ weapon: bastarda, wielded: true })
    );

    expect(atkOf(withPower)).toBe(atkOf(withoutPower) + 2);
  });

  it('não aplica o bônus quando nada está empunhado', () => {
    const withPower = recalculateSheet(
      buildSheet({
        power: desertor,
        originName: 'Desertor da Supremacia',
        weapon: bastarda,
        wielded: false,
      })
    );
    const withoutPower = recalculateSheet(
      buildSheet({ weapon: bastarda, wielded: false })
    );

    expect(atkOf(withPower)).toBe(atkOf(withoutPower));
  });
});
