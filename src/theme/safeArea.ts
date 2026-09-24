/**
 * Helpers de safe-area do iOS (notch / Dynamic Island / home indicator).
 *
 * O app roda edge-to-edge no PWA do iOS (`viewport-fit=cover` +
 * `apple-mobile-web-app-status-bar-style: black-translucent`, em `index.html`),
 * então toda superfície ancorada numa borda da viewport precisa somar o inset
 * correspondente — senão fica debaixo da status bar ou do home indicator.
 *
 * IMPORTANTE: nunca escrever `env(safe-area-inset-*, 20px)` com fallback
 * diferente de zero. O fallback só vale enquanto o `env()` não resolve; num
 * aparelho sem notch (já com `viewport-fit=cover`) ele resolve para `0px` e o
 * fallback nunca mais é usado — o espaçamento base simplesmente some. A forma
 * correta é sempre `calc(base + env(..., 0px))`, que é o que estes helpers
 * geram.
 *
 * Fora do PWA (desktop, navegador) todos os insets valem `0px`, então usar
 * estes helpers é inerte.
 */

/** Insets crus, para quando o espaçamento base é zero (barras coladas na borda). */
export const SAFE_AREA_TOP = 'env(safe-area-inset-top, 0px)';
export const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom, 0px)';
export const SAFE_AREA_LEFT = 'env(safe-area-inset-left, 0px)';
export const SAFE_AREA_RIGHT = 'env(safe-area-inset-right, 0px)';

type SafeAreaBase = number | string;

const toCssLength = (base: SafeAreaBase): string =>
  typeof base === 'number' ? `${base}px` : base;

const inset = (
  side: 'top' | 'bottom' | 'left' | 'right',
  base: SafeAreaBase
): string => `calc(${toCssLength(base)} + env(safe-area-inset-${side}, 0px))`;

/** `calc(base + env(safe-area-inset-top))` — para o que encosta no topo. */
export const safeTop = (base: SafeAreaBase = 0): string => inset('top', base);

/** `calc(base + env(safe-area-inset-bottom))` — para o que encosta no rodapé. */
export const safeBottom = (base: SafeAreaBase = 0): string =>
  inset('bottom', base);

/** `calc(base + env(safe-area-inset-left))` — relevante em landscape. */
export const safeLeft = (base: SafeAreaBase = 0): string => inset('left', base);

/** `calc(base + env(safe-area-inset-right))` — relevante em landscape. */
export const safeRight = (base: SafeAreaBase = 0): string =>
  inset('right', base);
