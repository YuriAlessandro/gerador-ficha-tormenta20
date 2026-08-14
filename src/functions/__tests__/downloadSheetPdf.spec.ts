/**
 * Testes do gerador de PDF.
 *
 * O ponto de partida foi um bug relatado: o PDF não trazia os poderes criados à
 * mão pelo usuário. A causa era `downloadSheetPdf` montar a lista de poderes por
 * conta própria, lendo só seis das oito fontes da ficha. O primeiro teste aqui é
 * a regressão desse bug; o resto cobre os outros pontos onde a exportação
 * descartava conteúdo em silêncio.
 *
 * `fillSheetPdf` recebe os bytes do template justamente para poder ser testada:
 * `preparePDF` faz um `fetch` que depende de `import.meta.env` e de um servidor.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { describe, it, expect, beforeAll } from 'vitest';
import { SupplementId } from '../../types/supplement.types';
import { generateEmptySheet } from '../general';
import SelectOptions from '../../interfaces/SelectedOptions';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { fillSheetPdf } from '../downloadSheetPdf';

const BASE_OPTIONS: SelectOptions = {
  nivel: 3,
  // Elfo em vez de Humano: o poder geral do Humano Versátil é sorteado a cada
  // recálculo e deixaria as asserções intermitentes.
  raca: 'Elfo',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

let template: Uint8Array;

/**
 * Uint8Array e não ArrayBuffer: sob jsdom o `ArrayBuffer` global é de outro
 * realm, e o `instanceof` do pdf-lib rejeita o buffer vindo do `fs`.
 */
const loadTemplate = (): Uint8Array =>
  new Uint8Array(
    readFileSync(path.resolve(__dirname, '../../../public/sheet.pdf'))
  );

const makeSheet = (): CharacterSheet => generateEmptySheet(BASE_OPTIONS, {});

const renderPdf = async (sheet: CharacterSheet) => {
  const bytes = await fillSheetPdf(template, sheet);
  const doc = await PDFDocument.load(bytes);
  return { doc, form: doc.getForm() };
};

const getText = (
  form: ReturnType<PDFDocument['getForm']>,
  field: string
): string => form.getTextField(field).getText() ?? '';

beforeAll(() => {
  template = loadTemplate();
});

describe('fillSheetPdf', () => {
  it('exporta os poderes criados à mão pelo usuário', async () => {
    const sheet = makeSheet();
    sheet.customPowers = [
      {
        id: 'custom-1',
        name: 'Golpe do Trovão Interior',
        description: 'Descrição escrita pelo jogador.',
      },
    ];
    sheet.customGrantedPowers = [
      {
        id: 'custom-2',
        name: 'Bênção Caseira',
        description: 'Poder concedido personalizado.',
      },
    ];

    const { form } = await renderPdf(sheet);
    const powers = getText(form, 'Historico');

    expect(powers).toContain('Golpe do Trovão Interior');
    expect(powers).toContain('Descrição escrita pelo jogador.');
    expect(powers).toContain('Bênção Caseira');
  });

  it('honra o nome e a descrição customizados de um poder', async () => {
    const sheet = makeSheet();
    sheet.customPowers = [
      {
        id: 'custom-3',
        name: 'Poder Canônico',
        description: 'Texto do livro.',
        customName: 'Meu Apelido',
        customDescription: 'Meu texto.',
      },
    ];

    const { form } = await renderPdf(sheet);
    const powers = getText(form, 'Historico');

    expect(powers).toContain('Meu Apelido');
    expect(powers).toContain('Meu texto.');
  });

  it('não duplica um poder que existe em duas fontes', async () => {
    const sheet = makeSheet();
    const duplicated = {
      id: 'custom-4',
      name: 'Poder Repetido',
      description: 'Aparece em duas listas.',
    };
    // Mesmo nome como poder geral E como concedido personalizado: antes o PDF
    // deduplicava por array e imprimia as duas linhas, cada uma com "(x2)".
    sheet.customPowers = [duplicated];
    sheet.customGrantedPowers = [duplicated];

    const { form } = await renderPdf(sheet);
    const powers = getText(form, 'Historico');
    const occurrences = powers.split('Poder Repetido').length - 1;

    expect(occurrences).toBe(1);
  });

  it('usa o nome customizado do item na tabela de ataques e no inventário', async () => {
    const sheet = makeSheet();
    const weapon = sheet.bag.equipments.Arma[0];
    expect(weapon).toBeDefined();
    weapon.customDisplayName = 'Fiel Companheira';

    const { form } = await renderPdf(sheet);

    expect(getText(form, 'ataque1')).toContain('Fiel Companheira');
    expect(`${getText(form, 'item1')}${getText(form, 'item2')}`).toContain(
      'Fiel Companheira'
    );
  });

  it('preenche os campos de página 1 que ficavam vazios', async () => {
    const sheet = makeSheet();
    sheet.dinheiro = 120;
    sheet.bonusDefense = 3;

    const { form } = await renderPdf(sheet);

    expect(getText(form, 'nivel')).toBe(`${sheet.nivel}`);
    expect(getText(form, 'T$')).toBe('120');
    expect(getText(form, 'defesaOutros')).toBe('3');
    expect(getText(form, 'penalidadeDeArmadura')).not.toBe('');
  });

  it('soma o modificador de tamanho na Furtividade', async () => {
    const small = makeSheet();
    small.size = {
      name: 'Pequeno',
      naturalRange: 1.5,
      modifiers: { stealth: 2, maneuver: -2 },
    };
    small.completeSkills = [
      {
        name: Skill.FURTIVIDADE,
        halfLevel: 1,
        modAttr: Atributo.DESTREZA,
        training: 0,
        others: 0,
      },
    ];

    const { form } = await renderPdf(small);
    const attr = small.atributos.Destreza.value;

    // Só há Furtividade + os dois Ofícios que o template sempre reserva, e a
    // ordenação é alfabética: Furtividade cai na primeira linha.
    expect(getText(form, 'total1')).toBe(`${1 + attr + 2}`);
    expect(getText(form, 'tFurtividade')).toBe('+2');
  });

  it('não anexa página extra quando nada ficou de fora', async () => {
    const { doc } = await renderPdf(makeSheet());
    expect(doc.getPageCount()).toBe(3);
  });

  it('leva as anotações do jogador para uma página extra', async () => {
    const sheet = makeSheet();
    sheet.notes = 'Devo 300 T$ ao Bardo. Não confiar no taverneiro.';

    const { doc } = await renderPdf(sheet);
    expect(doc.getPageCount()).toBeGreaterThan(3);
  });

  it('não perde inventário grande no corte de 2000 caracteres', async () => {
    const sheet = makeSheet();
    const catalogItem = sheet.bag.equipments['Item Geral'][0];
    expect(catalogItem).toBeDefined();
    // 120 itens de nome longo estouram com folga os dois campos do template.
    sheet.bag.equipments['Item Geral'] = Array.from(
      { length: 120 },
      (_, index) => ({
        ...catalogItem,
        id: `item-teste-${index}`,
        nome: `Item De Nome Bastante Longo Numero ${index}`,
      })
    );

    const { doc } = await renderPdf(sheet);
    expect(doc.getPageCount()).toBeGreaterThan(3);
  });

  it('não estoura com três ou mais Ofícios treinados', async () => {
    const sheet = makeSheet();
    sheet.completeSkills = [
      Skill.OFICIO_ARMEIRO,
      Skill.OFICIO_ALQUIMIA,
      Skill.OFICIO_CULINARIA,
    ].map((name) => ({
      name,
      halfLevel: 1,
      modAttr: Atributo.INTELIGENCIA,
      training: 4,
      others: 0,
    }));

    const { doc } = await renderPdf(sheet);
    // O 3º Ofício não cabe no template e vai para a continuação.
    expect(doc.getPageCount()).toBeGreaterThan(3);
  });
});
