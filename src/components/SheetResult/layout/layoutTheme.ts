/**
 * A aparência de um layout: fundos e fontes.
 *
 * Fica no repo público porque quem APLICA é o renderer; o painel do editor
 * (premium) apenas consome a mesma lista para desenhar as opções. Duplicar o
 * catálogo dos dois lados garantiria que uma hora eles divergiriam.
 *
 * ---
 *
 * Fundos curados para a ficha.
 *
 * São CSS puro — gradientes e padrões repetidos — e não arquivos de imagem.
 * Três razões, nesta ordem:
 *
 * 1. Zero bytes de rede e zero peso no repositório, num app que já vai servir
 *    ~4.200 ícones.
 * 2. Textura atrás de uma ficha precisa ser DISCRETA para o texto continuar
 *    legível; foto quase sempre atrapalha, e padrão sutil quase sempre ajuda.
 * 3. Sendo CSS, o fundo acompanha o tamanho da tela sem esticar nem cortar.
 *
 * Quem quiser a própria imagem cola uma URL https — mesmo caminho do avatar de
 * ficha, da foto de perfil e das imagens do blog.
 */

export interface SheetBackgroundPreset {
  id: string;
  label: string;
  /** Valor de `background` do CSS. */
  css: string;
  /** Combina melhor com texto claro? Usado para sugerir a cor dos títulos. */
  dark: boolean;
}

export const SHEET_BACKGROUND_PRESETS: SheetBackgroundPreset[] = [
  {
    id: 'pergaminho',
    label: 'Pergaminho',
    css: 'radial-gradient(ellipse at 30% 20%, #f3e3c3 0%, #e6d2ab 45%, #d8c092 100%)',
    dark: false,
  },
  {
    id: 'pedra',
    label: 'Pedra',
    css: 'repeating-linear-gradient(135deg, #6f6f6f 0px, #6f6f6f 12px, #666 12px, #666 24px)',
    dark: true,
  },
  {
    id: 'escamas',
    label: 'Escamas',
    css: 'radial-gradient(circle at 50% 0%, #2f4f4f 18px, transparent 19px) 0 0/36px 24px, radial-gradient(circle at 50% 0%, #2f4f4f 18px, transparent 19px) 18px 12px/36px 24px, #24413f',
    dark: true,
  },
  {
    id: 'tormenta',
    label: 'Tormenta',
    css: 'radial-gradient(ellipse at 70% 30%, #7b1030 0%, #4a0a1e 50%, #24050f 100%)',
    dark: true,
  },
  {
    id: 'floresta',
    label: 'Floresta',
    css: 'linear-gradient(160deg, #1f3d2b 0%, #2c5539 55%, #17301f 100%)',
    dark: true,
  },
  {
    id: 'arcano',
    label: 'Arcano',
    css: 'radial-gradient(ellipse at 20% 80%, #3b2a6b 0%, #241a44 55%, #120d24 100%)',
    dark: true,
  },
  {
    id: 'linho',
    label: 'Linho',
    css: 'repeating-linear-gradient(0deg, #faf7f0 0px, #faf7f0 2px, #f2ede1 2px, #f2ede1 4px)',
    dark: false,
  },
  {
    id: 'grade',
    label: 'Grade',
    css: 'linear-gradient(#0000 calc(100% - 1px), #8883 0) 0 0/24px 24px, linear-gradient(90deg, #0000 calc(100% - 1px), #8883 0) 0 0/24px 24px',
    dark: false,
  },
];

export const getBackgroundPreset = (
  id?: string
): SheetBackgroundPreset | undefined =>
  id ? SHEET_BACKGROUND_PRESETS.find((p) => p.id === id) : undefined;

/**
 * Mesma regra do `profileController`: só o protocolo é checado, sem allowlist
 * de host. É o padrão que o app inteiro já usa para imagem colada pelo usuário.
 */
export const isSafeBackgroundUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ *
 * Fontes
 * ------------------------------------------------------------------ */

export interface LayoutFontOption {
  id: string;
  label: string;
  stack: string;
}

/**
 * As mesmas famílias oferecidas na personalização de perfil.
 *
 * A lista é duplicada aqui em vez de importada de `premium/.../themeStyles`
 * porque o renderer é público e precisa funcionar no build sem o submódulo —
 * importar de lá exigiria um stub, e um stub que devolvesse `inherit` faria a
 * fonte escolhida sumir silenciosamente numa ficha compartilhada.
 */
export const LAYOUT_FONTS: LayoutFontOption[] = [
  {
    id: 'serif',
    label: 'Serifada',
    stack: 'Georgia, "Times New Roman", serif',
  },
  {
    id: 'mono',
    label: 'Monoespaçada',
    stack: '"Courier New", Courier, monospace',
  },
  { id: 'cinzel', label: 'Cinzel (épica)', stack: '"Cinzel", Georgia, serif' },
  { id: 'lato', label: 'Lato (limpa)', stack: '"Lato", Helvetica, sans-serif' },
  {
    id: 'merriweather',
    label: 'Merriweather (livro)',
    stack: '"Merriweather", Georgia, serif',
  },
];

export const resolveLayoutFont = (id?: string): string | undefined =>
  id ? LAYOUT_FONTS.find((f) => f.id === id)?.stack : undefined;
