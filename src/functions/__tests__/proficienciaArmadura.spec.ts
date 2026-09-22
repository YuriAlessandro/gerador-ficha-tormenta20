import { describe, expect, it } from 'vitest';
import { isProficientWithDefense } from '../proficiencies';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { DefenseEquipment } from '../../interfaces/Equipment';

/**
 * Proficiência com armaduras PESADAS inclui as leves.
 *
 * O Vassalo começa só com armas marciais e escudos e recebe pesadas no 3º
 * nível. Sem a inclusão, ganhar a proficiência mais restritiva fazia a
 * armadura leve inicial passar a dar penalidade — quem treinou para a pesada
 * não desaprende a leve.
 */

const armaduras = Object.values(Armaduras) as DefenseEquipment[];
const leve = armaduras.find(
  (item) => item.group === 'Armadura' && item.nome === 'Armadura de couro'
);
const pesada = armaduras.find(
  (item) => item.group === 'Armadura' && item.nome === 'Brunea'
);

describe('isProficientWithDefense', () => {
  it('os dois exemplos existem no catálogo', () => {
    // Guarda da premissa: um rename tornaria os testes abaixo vazios.
    expect(leve).toBeDefined();
    expect(pesada).toBeDefined();
  });

  it('só pesadas já cobre armadura leve', () => {
    expect(isProficientWithDefense(leve!, [PROFICIENCIAS.PESADAS])).toBe(true);
  });

  it('só leves continua cobrindo armadura leve', () => {
    expect(isProficientWithDefense(leve!, [PROFICIENCIAS.LEVES])).toBe(true);
  });

  it('só leves NÃO cobre armadura pesada', () => {
    expect(isProficientWithDefense(pesada!, [PROFICIENCIAS.LEVES])).toBe(false);
  });

  it('sem proficiência de armadura, nenhuma das duas', () => {
    expect(isProficientWithDefense(leve!, [PROFICIENCIAS.ESCUDOS])).toBe(false);
    expect(isProficientWithDefense(pesada!, [PROFICIENCIAS.ESCUDOS])).toBe(
      false
    );
  });
});
