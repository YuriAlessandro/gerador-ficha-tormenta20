import { describe, expect, it } from 'vitest';
import CAVALEIRO, {
  CAMINHO_DO_CAVALEIRO,
  CAMINHO_OPTION_KEY,
} from '@/data/systems/tormenta20/classes/cavaleiro';
import VASSALO from '@/data/systems/tormenta20/herois-de-arton/variantClasses/vassalo';
import generateRandomSheet from '@/functions/general';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import { getCavaleiroCaminho } from '@/functions/powers/cavaleiroCaminho';
import SelectOptions from '@/interfaces/SelectedOptions';
import { SupplementId } from '@/types/supplement.types';

/**
 * O Caminho do Cavaleiro é escolha do JOGADOR (Bastião ou Montaria). Era prosa
 * dentro do texto da habilidade: nunca chegava a ser perguntado, e o efeito do
 * Bastião dependia de um campo que ninguém preenchia.
 *
 * O Vassalo tem o mesmo caminho, mas sem escolha — o Vigilante de Estradas já
 * determina Montaria.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const abilityOf = (abilities: typeof CAVALEIRO.abilities, name: string) =>
  abilities.find((ability) => ability.name === name);

const gerar = (classe: string) =>
  generateRandomSheet({
    nivel: 5,
    classe,
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

describe('Caminho do Cavaleiro como escolha', () => {
  it('o Cavaleiro é perguntado, com as duas opções', () => {
    const ability = abilityOf(CAVALEIRO.abilities, CAMINHO_DO_CAVALEIRO)!;
    const requirements = getPowerSelectionRequirements(ability);

    const escolha = requirements?.requirements.find(
      (req) => req.type === 'chooseFromOptions'
    );
    expect(escolha?.metadata?.optionKey).toBe(CAMINHO_OPTION_KEY);
    expect(escolha?.availableOptions).toHaveLength(2);
  });

  it('o Vassalo tem a habilidade, com uma opção só', () => {
    const ability = abilityOf(VASSALO.abilities ?? [], CAMINHO_DO_CAVALEIRO);
    expect(ability).toBeDefined();
    expect(ability?.nivel).toBe(5);

    const escolha = getPowerSelectionRequirements(ability!)?.requirements.find(
      (req) => req.type === 'chooseFromOptions'
    );
    // Uma opção só: o assistente resolve sozinho, sem perguntar.
    expect(escolha?.availableOptions).toHaveLength(1);
  });

  it('o caminho é derivado da escolha nos dois casos', () => {
    // É o que a RD do Bastião lê, em `recalculateSheet` e `general`.
    expect(['Bastião', 'Montaria']).toContain(
      getCavaleiroCaminho(gerar('Cavaleiro'))
    );
    expect(getCavaleiroCaminho(gerar('Vassalo'))).toBe('Montaria');
  });

  it('a habilidade exibe só o caminho escolhido', () => {
    const cavaleiro = gerar('Cavaleiro');
    const texto =
      abilityOf(cavaleiro.classe.abilities, CAMINHO_DO_CAVALEIRO)?.text ?? '';

    const caminho = getCavaleiroCaminho(cavaleiro)!;
    expect(texto).toContain(caminho);
    const outro = caminho === 'Bastião' ? 'Montaria' : 'Bastião';
    expect(texto).not.toContain(outro);
  });
});
