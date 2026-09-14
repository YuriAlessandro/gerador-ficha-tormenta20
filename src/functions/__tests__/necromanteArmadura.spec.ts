import { describe, expect, it } from 'vitest';
import generateRandomSheet, {
  buildClassEquipmentsFromChoices,
} from '../general';
import { findClassDescription } from '../multiclass';
import { Armas, Armaduras } from '../../data/systems/tormenta20/equipamentos';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * Arcanista não recebe armadura inicial (armaduras atrapalham a conjuração
 * arcana). A checagem era por nome EXATO, então o Necromante — variante de
 * Arcanista — começava armado.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const gerar = (classe: string) =>
  generateRandomSheet({
    nivel: 1,
    classe,
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

const armadurasDe = (sheet: ReturnType<typeof gerar>) =>
  sheet.bag?.equipments?.Armadura ?? [];

describe('armadura inicial do Arcanista e variantes', () => {
  it('Necromante é variante de Arcanista', () => {
    // Guarda da premissa: se deixar de ser variante, o teste abaixo perde o
    // sentido em vez de falhar.
    const necromante = findClassDescription('Necromante', undefined, SUPPS);
    expect(necromante?.isVariant).toBe(true);
    expect(necromante?.baseClassName).toBe('Arcanista');
  });

  it('Necromante não começa com armadura na ficha aleatória', () => {
    expect(armadurasDe(gerar('Necromante'))).toHaveLength(0);
  });

  it('Arcanista continua sem armadura', () => {
    expect(armadurasDe(gerar('Arcanista'))).toHaveLength(0);
  });

  it('classe não arcana continua recebendo', () => {
    expect(armadurasDe(gerar('Guerreiro')).length).toBeGreaterThan(0);
  });

  it('nem escolhendo uma no assistente o Necromante recebe', () => {
    const necromante = findClassDescription('Necromante', undefined, SUPPS)!;
    const result = buildClassEquipmentsFromChoices(necromante, {
      simpleWeapon: Armas.ADAGA,
      armor: Armaduras.ARMADURADECOURO,
    });

    expect(result.Armadura).toHaveLength(0);
  });
});
