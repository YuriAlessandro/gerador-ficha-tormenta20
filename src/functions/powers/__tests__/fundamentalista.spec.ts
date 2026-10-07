/**
 * Regra do Fundamentalista (Deuses de Arton, p. 11–12). O app só informa:
 * os testes cobrem elegibilidade, dogma, contagem de poderes e os avisos.
 */
import { describe, it, expect } from 'vitest';
import {
  ClassIdentity,
  formatDogmaPages,
  getAvailableDogmas,
  getDogma,
  getDogmaHeritageNote,
  getDeityPowerGroupTitle,
  hasPendingExtraPower,
  setSheetFundamentalista,
  dismissPendingExtraPower,
  withEditedGrantedPowers,
  getFundamentalistaSummary,
  getDogmaFallbackNotice,
  getFundamentalistNotices,
  getGrantedPowerCount,
  getPreferredWeaponWarning,
  getSheetFundamentalista,
  isDivineClass,
  isFundamentalistBlocked,
  isFundamentalistEligibleDeity,
  isPreferredWeapon,
  resolveDogmaForClass,
  resolveFundamentalistChoice,
} from '../fundamentalista';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import Equipment from '../../../interfaces/Equipment';
import { DogmaFundamentalista } from '../../../interfaces/Character';
import { SupplementId } from '../../../types/supplement.types';
import MINOTAURO from '../../../data/systems/tormenta20/races/minotauro';
import TABRACHI from '../../../data/systems/tormenta20/ameacas-de-arton/races/tabrachi';

const GUERREIRO = { name: 'Guerreiro' };
const CLERIGO = { name: 'Clérigo' };
const PALADINO = { name: 'Paladino' };
const DRUIDA = { name: 'Druida' };
// Variante de classe por divindade (Deuses de Arton) — conta como Paladino.
const PALADINO_VARIANTE: ClassIdentity = {
  name: 'Paladino de Marah',
  isVariant: true,
  baseClassName: 'Paladino',
};

const weapon = (nome: string, extra: Partial<Equipment> = {}): Equipment => ({
  nome,
  group: 'Arma',
  ...extra,
});

/** Divindade como sai do storage: só o nome, catálogo esvaziado. */
const fundamentalistSheet = (
  deity: string,
  dogma: DogmaFundamentalista = 'sacerdote'
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    divindade: { name: deity, poderes: [] },
    poderes: [],
    fundamentalista: { dogma },
  };
  return sheet;
};

const DEUSES_ARTON = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

describe('elegibilidade', () => {
  it('aceita os 20 deuses maiores pelo nome ou pela chave do enum', () => {
    expect(isFundamentalistEligibleDeity('Khalmyr')).toBe(true);
    expect(isFundamentalistEligibleDeity('Tanna-Toh')).toBe(true);
    expect(isFundamentalistEligibleDeity('TANNATOH')).toBe(true);
    expect(isFundamentalistEligibleDeity('LINWU')).toBe(true);
  });

  it('recusa deus menor, homebrew, vazio e "não devoto"', () => {
    expect(isFundamentalistEligibleDeity('Deus Inventado')).toBe(false);
    expect(isFundamentalistEligibleDeity('')).toBe(false);
    expect(isFundamentalistEligibleDeity('--')).toBe(false);
    expect(isFundamentalistEligibleDeity(undefined)).toBe(false);
  });
});

describe('dogma', () => {
  it('classe divina usa o próprio dogma (variante conta como a base)', () => {
    expect(isDivineClass(CLERIGO)).toBe(true);
    expect(isDivineClass(PALADINO_VARIANTE)).toBe(true);
    expect(isDivineClass(GUERREIRO)).toBe(false);
    expect(resolveDogmaForClass(PALADINO, 'Khalmyr')).toBe('paladino');
    expect(resolveDogmaForClass(PALADINO_VARIANTE, 'Marah')).toBe('paladino');
    expect(resolveDogmaForClass(DRUIDA, 'Oceano')).toBe('druida');
    expect(resolveDogmaForClass({ name: 'Frade' }, 'Lena')).toBe('sacerdote');
  });

  it('cai para sacerdote quando o deus não tem o dogma da classe', () => {
    // Druida de Khalmyr só existe com Devoções Abertas.
    expect(resolveDogmaForClass(DRUIDA, 'Khalmyr')).toBe('sacerdote');
  });

  it('classe não divina usa a escolha, se o deus a tiver', () => {
    expect(resolveDogmaForClass(GUERREIRO, 'Azgher', 'paladino')).toBe(
      'paladino'
    );
    expect(resolveDogmaForClass(GUERREIRO, 'Azgher', 'druida')).toBe(
      'sacerdote'
    );
    expect(resolveDogmaForClass(GUERREIRO, 'Azgher')).toBe('sacerdote');
  });

  it('lista os dogmas disponíveis do deus', () => {
    expect(getAvailableDogmas('Azgher')).toEqual(['sacerdote', 'paladino']);
    expect(getAvailableDogmas('Oceano')).toEqual(['sacerdote', 'druida']);
    expect(getAvailableDogmas('Deus Inventado')).toEqual([]);
  });

  it('dogma que herda o do sacerdote junta os dois resumos e as páginas', () => {
    const sacerdote = getDogma('Azgher', 'sacerdote');
    const paladino = getDogma('Azgher', 'paladino');
    expect(paladino?.texto.startsWith(sacerdote?.texto ?? '-')).toBe(true);
    expect(paladino?.texto).toContain('necromantes');
    expect(paladino?.paginas).toEqual([13, 28]);
    // Khalmyr: herda sem complemento.
    expect(getDogma('Khalmyr', 'paladino')?.texto).toBe(
      getDogma('Khalmyr', 'sacerdote')?.texto
    );
    expect(formatDogmaPages([13, 28])).toBe('p. 13 e 28');
    expect(formatDogmaPages([15])).toBe('p. 15');
  });
});

describe('indicação de dogma herdado do sacerdote', () => {
  it('diz quando o dogma é igual ao do sacerdote', () => {
    const info = getDogma('Khalmyr', 'paladino');
    expect(info?.heranca).toBe('igual');
    expect(getDogmaHeritageNote(info)).toBe('Mesmo dogma do sacerdote.');
  });

  it('diz quando o dogma é o do sacerdote com acréscimo', () => {
    const info = getDogma('Azgher', 'paladino');
    expect(info?.heranca).toBe('complemento');
    expect(getDogmaHeritageNote(info)).toBe('Dogma do sacerdote, mais:');
  });

  it('não diz nada para dogma próprio', () => {
    expect(getDogma('Lena', 'paladino')?.heranca).toBeUndefined();
    expect(getDogma('Khalmyr', 'sacerdote')?.heranca).toBeUndefined();
    expect(getDogmaHeritageNote(getDogma('Lena', 'paladino'))).toBeUndefined();
  });

  it('o resumo do PDF leva a indicação', () => {
    expect(
      getFundamentalistaSummary(fundamentalistSheet('Khalmyr', 'paladino'))
    ).toContain('Mesmo dogma do sacerdote.');
  });
});

describe('aviso de dogma adaptado', () => {
  it('explica que usar o dogma de sacerdote é adaptação do app', () => {
    // Druida de Khalmyr (Devoções Abertas): o livro não tem dogma de druida.
    const notice = getDogmaFallbackNotice(DRUIDA, 'Khalmyr');
    expect(notice).toMatch(/Khalmyr não tem dogma de druida/);
    expect(notice).toMatch(/não é regra do livro/);
  });

  it('não avisa quando o dogma da classe existe ou a classe não é divina', () => {
    expect(getDogmaFallbackNotice(DRUIDA, 'Oceano')).toBeUndefined();
    expect(getDogmaFallbackNotice(CLERIGO, 'Khalmyr')).toBeUndefined();
    expect(getDogmaFallbackNotice(GUERREIRO, 'Khalmyr')).toBeUndefined();
  });
});

describe('avisos de jogabilidade', () => {
  it('avisa dogma de NPC só para o dogma marcado, deixando claro que é avaliação do app', () => {
    const [notice] = getFundamentalistNotices('Marah', 'sacerdote');
    expect(notice).toMatch(/não é regra do livro/);
    expect(getFundamentalistNotices('Marah', 'sacerdote')).toHaveLength(1);
    expect(getFundamentalistNotices('Marah', 'paladino')).toHaveLength(0);
  });

  it('avisa raça no paladino de Valkaria', () => {
    expect(getFundamentalistNotices('Valkaria', 'paladino', 'Elfo')[0]).toMatch(
      /humanos/
    );
    expect(getFundamentalistNotices('Valkaria', 'paladino', 'Humano')).toEqual(
      []
    );
    expect(getFundamentalistNotices('Valkaria', 'sacerdote', 'Elfo')).toEqual(
      []
    );
  });
});

describe('restrição de raça (regra do livro)', () => {
  it('bloqueia paladino de Valkaria que não seja humano', () => {
    expect(isFundamentalistBlocked('Valkaria', 'paladino', 'Elfo')).toBe(true);
    expect(isFundamentalistBlocked('Valkaria', 'paladino', 'Humano')).toBe(
      false
    );
    expect(isFundamentalistBlocked('Valkaria', 'sacerdote', 'Elfo')).toBe(
      false
    );
    expect(isFundamentalistBlocked('Khalmyr', 'paladino', 'Elfo')).toBe(false);
  });

  it('a escolha do formulário não vale quando bloqueada', () => {
    const options = {
      fundamentalista: true,
      supplements: DEUSES_ARTON,
      raca: 'Elfo',
    };
    expect(
      resolveFundamentalistChoice(options, PALADINO, 'Valkaria')
    ).toBeUndefined();
    expect(
      resolveFundamentalistChoice(
        { ...options, raca: 'Humano' },
        PALADINO,
        'Valkaria'
      )
    ).toEqual({ dogma: 'paladino' });
  });
});

describe('contagem de poderes concedidos', () => {
  it('soma 1 ao valor da classe, com 1 como padrão', () => {
    expect(getGrantedPowerCount(2, false)).toBe(2);
    expect(getGrantedPowerCount(2, true)).toBe(3);
    expect(getGrantedPowerCount(undefined, false)).toBe(1);
    expect(getGrantedPowerCount(undefined, true)).toBe(2);
  });

  it('"all" continua "all"', () => {
    expect(getGrantedPowerCount('all', true)).toBe('all');
  });
});

describe('ficha', () => {
  it('lê a marca e ignora a combinação com devoção dupla', () => {
    const sheet = fundamentalistSheet('Khalmyr', 'paladino');
    expect(getSheetFundamentalista(sheet)).toBe('paladino');
    sheet.devoto!.divindadeSecundaria = 'Tanna-Toh';
    expect(getSheetFundamentalista(sheet)).toBeUndefined();
    expect(getSheetFundamentalista(createMockCharacterSheet())).toBeUndefined();
  });

  it('resumo para o PDF cita dogma, arma, punição e página', () => {
    const summary = getFundamentalistaSummary(fundamentalistSheet('Khalmyr'));
    expect(summary).toContain('Khalmyr');
    expect(summary).toContain('Espada Longa');
    expect(summary).toContain('PM');
    expect(summary).toContain('Deuses de Arton, p. 15');
    expect(getFundamentalistaSummary(createMockCharacterSheet())).toBe('');
  });
});

describe('arma preferida', () => {
  it('compara pelo nome de catálogo, ignorando nome customizado e melhorias', () => {
    expect(isPreferredWeapon(weapon('Espada Longa'), 'Khalmyr')).toBe(true);
    expect(isPreferredWeapon(weapon('espada longa'), 'Khalmyr')).toBe(true);
    expect(isPreferredWeapon(weapon('Espada Bastarda'), 'Khalmyr')).toBe(false);
  });

  it('arma gerada com melhorias no nome continua sendo a preferida', () => {
    // O gerador de itens renomeia: "Espada Longa (Certeira, Pungente)".
    expect(
      isPreferredWeapon(weapon('Espada Longa (Certeira, Pungente)'), 'Khalmyr')
    ).toBe(true);
    expect(
      getPreferredWeaponWarning(
        fundamentalistSheet('Khalmyr'),
        weapon('Espada Longa (Certeira)')
      )
    ).toBeUndefined();
  });

  it('arma natural da raça sem a tag (ficha antiga) não ganha aviso', () => {
    const sheet = fundamentalistSheet('Arsenal');
    sheet.raca = MINOTAURO;
    // Fichas anteriores a 29/08/2026 guardaram os chifres sem `weaponTags`.
    expect(getPreferredWeaponWarning(sheet, weapon('Chifres'))).toBeUndefined();
  });

  it('a língua do Tabrachi é arma natural', () => {
    const sheet = fundamentalistSheet('Oceano');
    sheet.raca = TABRACHI;
    const lingua = TABRACHI.abilities
      .flatMap((a) => a.sheetActions ?? [])
      .flatMap((sa) =>
        sa.action.type === 'addEquipment' ? sa.action.equipment.Arma ?? [] : []
      )[0];
    expect(lingua.weaponTags).toContain('natural');
  });

  it('variações de nome parecido são outras armas', () => {
    expect(isPreferredWeapon(weapon('Adaga oposta'), 'Wynna')).toBe(false);
    expect(isPreferredWeapon(weapon('Maça-estrela'), 'Megalokk')).toBe(false);
    expect(isPreferredWeapon(weapon('Lança Montada'), 'Kallyadranoch')).toBe(
      false
    );
  });

  it('Nimb aceita tudo; Lena e Marah, nada', () => {
    expect(isPreferredWeapon(weapon('Tacape'), 'Nimb')).toBe(true);
    expect(isPreferredWeapon(weapon('Adaga'), 'Lena')).toBe(false);
  });

  it('avisa só em ficha fundamentalista e só em armas de verdade', () => {
    const sheet = fundamentalistSheet('Khalmyr');
    const warning = getPreferredWeaponWarning(
      sheet,
      weapon('Machado de Guerra')
    );
    expect(warning).toContain('Espada Longa');
    expect(warning).toContain('Variações ficam a critério do mestre.');

    const espada = weapon('Espada Longa', { customDisplayName: 'Justiça' });
    expect(getPreferredWeaponWarning(sheet, espada)).toBeUndefined();
    expect(
      getPreferredWeaponWarning(
        sheet,
        weapon('Garras', { weaponTags: ['natural'] })
      )
    ).toBeUndefined();
    expect(
      getPreferredWeaponWarning(sheet, weapon('Ataque Desarmado'))
    ).toBeUndefined();
    expect(
      getPreferredWeaponWarning(sheet, weapon('Flecha', { isAmmo: true }))
    ).toBeUndefined();
    expect(
      getPreferredWeaponWarning(sheet, {
        nome: 'Cota de Malha',
        group: 'Armadura',
      })
    ).toBeUndefined();

    const comum = createMockCharacterSheet();
    expect(
      getPreferredWeaponWarning(comum, weapon('Machado de Guerra'))
    ).toBeUndefined();
  });
});

describe('escolha do formulário', () => {
  const ligado = {
    fundamentalista: true,
    supplements: DEUSES_ARTON,
  };

  it('resolve o dogma quando tudo vale', () => {
    expect(resolveFundamentalistChoice(ligado, CLERIGO, 'Khalmyr')).toEqual({
      dogma: 'sacerdote',
    });
    expect(
      resolveFundamentalistChoice(
        { ...ligado, dogmaFundamentalista: 'paladino' },
        GUERREIRO,
        'Khalmyr'
      )
    ).toEqual({ dogma: 'paladino' });
  });

  it('descarta opção velha: sem suplemento, deus não elegível, devoção dupla ou desligado', () => {
    expect(
      resolveFundamentalistChoice(
        { ...ligado, supplements: [SupplementId.TORMENTA20_CORE] },
        CLERIGO,
        'Khalmyr'
      )
    ).toBeUndefined();
    expect(
      resolveFundamentalistChoice(ligado, CLERIGO, 'Deus Inventado')
    ).toBeUndefined();
    expect(
      resolveFundamentalistChoice(
        { ...ligado, dualDevotion: true },
        CLERIGO,
        'Khalmyr'
      )
    ).toBeUndefined();
    expect(
      resolveFundamentalistChoice(
        { ...ligado, fundamentalista: false },
        CLERIGO,
        'Khalmyr'
      )
    ).toBeUndefined();
  });
});

describe('poder adicional pendente (ao desligar o fundamentalismo)', () => {
  const devotoBase = () => fundamentalistSheet('Khalmyr').devoto!;
  const poder = (name: string) =>
    ({ name } as unknown as CharacterSheet['devoto'] & { name: string });

  it('desligar grava a marca; religar apaga', () => {
    const desligado = setSheetFundamentalista(devotoBase(), undefined);
    expect(desligado.fundamentalista).toBeUndefined();
    expect(desligado.poderAdicionalPendente).toBe(true);

    const religado = setSheetFundamentalista(desligado, 'sacerdote');
    expect(religado.fundamentalista).toEqual({ dogma: 'sacerdote' });
    expect(religado.poderAdicionalPendente).toBeUndefined();
  });

  it('desligar quem não era fundamentalista não grava a marca', () => {
    const comum = { ...devotoBase(), fundamentalista: undefined };
    expect(
      setSheetFundamentalista(comum, undefined).poderAdicionalPendente
    ).toBeUndefined();
  });

  it('hasPendingExtraPower lê a marca da ficha', () => {
    const sheet = fundamentalistSheet('Khalmyr');
    expect(hasPendingExtraPower(sheet)).toBe(false);
    sheet.devoto = setSheetFundamentalista(sheet.devoto!, undefined);
    expect(hasPendingExtraPower(sheet)).toBe(true);
  });

  it('"Manter assim" apaga a marca', () => {
    const desligado = setSheetFundamentalista(devotoBase(), undefined);
    expect(
      dismissPendingExtraPower(desligado).poderAdicionalPendente
    ).toBeUndefined();
  });

  it('remover um poder concedido no editor apaga a marca; manter ou adicionar não', () => {
    const desligado = {
      ...setSheetFundamentalista(devotoBase(), undefined),
      poderes: [poder('A'), poder('B')],
    } as unknown as NonNullable<CharacterSheet['devoto']>;
    const menos = withEditedGrantedPowers(desligado, [desligado.poderes[0]]);
    expect(menos.poderes).toHaveLength(1);
    expect(menos.poderAdicionalPendente).toBeUndefined();

    const iguais = withEditedGrantedPowers(desligado, desligado.poderes);
    expect(iguais.poderAdicionalPendente).toBe(true);
  });

  it('o título do grupo no editor avisa da marca', () => {
    const sheet = fundamentalistSheet('Khalmyr');
    sheet.devoto = setSheetFundamentalista(sheet.devoto!, undefined);
    expect(getDeityPowerGroupTitle(sheet, 2, 'Khalmyr')).toMatch(
      /adicional do fundamentalismo/
    );
  });

  it('o título mostra as vagas quando fundamentalista e fica simples no caso comum', () => {
    const fund = fundamentalistSheet('Khalmyr');
    fund.classe = { ...fund.classe, qtdPoderesConcedidos: 2 };
    expect(getDeityPowerGroupTitle(fund, 2, 'Khalmyr')).toBe(
      'Concedidos por Khalmyr (fundamentalista: 2 de 3)'
    );
    const comum = createMockCharacterSheet();
    expect(getDeityPowerGroupTitle(comum, 1, 'Khalmyr')).toBe(
      'Concedidos por Khalmyr'
    );
  });
});
