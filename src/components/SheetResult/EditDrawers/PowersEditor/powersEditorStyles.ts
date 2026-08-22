import { EASE_OUT } from '../../common/listStyles';

/**
 * O que é próprio do editor. Todo o resto — `ROW_SX`, `TOOLBAR_SX`,
 * `GROUP_HEADER_SX`, `NAME_SX`, `COUNT_CHIP_SX`, `CHIP_SCROLLER_SX` — vem de
 * `SheetResult/common/listStyles`, o mesmo vocabulário das abas de Poderes e
 * Magias da ficha, para o editor não parecer outro app.
 */

export {
  CHIP_SCROLLER_SX,
  COUNT_CHIP_SX,
  EASE_OUT,
  EMPTY_SX,
  FILTER_CHIP_SX,
  GROUP_HEADER_SX,
  GROUP_TITLE_SX,
  NAME_SX,
  ROW_SX,
  TOOLBAR_SX,
} from '../../common/listStyles';

/** Largura do painel "na ficha" no desktop. */
export const SELECTED_PANEL_WIDTH = 340;

/** O catálogo pode encolher até aqui antes de o painel direito ceder espaço. */
export const CATALOG_MIN_WIDTH = 380;

/**
 * A linha do catálogo em repouso é **neutra**. O editor antigo pintava toda
 * caixa com uma borda de 2px verde ou vermelha conforme os pré-requisitos, e o
 * resultado era uma parede saturada onde nada se destacava. Aqui a cor entra
 * só onde carrega informação: a guia lateral colorida marca o que já está na
 * ficha, e o requisito não atendido aparece no detalhe expandido.
 */
export const CATALOG_ROW_SX = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 0.5,
  // `box-sizing` NÃO é border-box globalmente neste projeto: o `@tailwind base`
  // está comentado em `assets/css/index.css` e não há `CssBaseline`. Sem esta
  // linha, `width: 100%` somado a `px` e à borda esquerda estourava a coluna e
  // criava barra de rolagem horizontal no catálogo inteiro.
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 44,
  px: 1,
  py: 0,
  borderBottom: '1px solid',
  borderColor: 'divider',
  borderLeft: '3px solid transparent',
  transition: `background-color 140ms ${EASE_OUT}, border-color 140ms ${EASE_OUT}`,
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': { bgcolor: 'action.hover' },
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
} as const;

/**
 * O botão de expandir cobre a linha inteira — o alvo de clique é a linha, não
 * o texto.
 *
 * `width: '100%'` é obrigatório e não decorativo: o `ButtonBase` do MUI nasce
 * `inline-flex`, então sem isso ele se dimensiona pelo conteúdo. O resultado
 * era o `ml: 'auto'` da seta não ter para onde empurrar (ela colava no nome) e
 * nomes longos estourarem a coluna, criando barra de rolagem horizontal no
 * catálogo inteiro.
 */
export const ROW_BUTTON_SX = {
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  textAlign: 'left',
  minHeight: 44,
  py: 0.5,
  px: 0,
  color: 'inherit',
  justifyContent: 'flex-start',
  transition: `transform 140ms ${EASE_OUT}`,
  '&:active': { transform: 'scale(0.995)' },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:active': { transform: 'none' },
  },
} as const;

/** Chip de requisito, atendido ou não. */
export const REQUIREMENT_CHIP_SX = {
  height: 26,
  fontSize: '0.8rem',
  '& .MuiChip-label': { px: 0.875 },
  '& .MuiChip-icon': { ml: 0.625, mr: -0.25, fontSize: '0.95rem' },
} as const;

/**
 * O nome do poder é o texto que o usuário lê o tempo todo aqui, então ele fica
 * no tamanho do corpo do app. O `NAME_SX` compartilhado usa `0.9rem`, calibrado
 * para as listas da ficha, onde o nome divide a linha com muito mais coisa.
 */
export const CATALOG_NAME_SX = {
  flex: 1,
  minWidth: 0,
  fontWeight: 700,
  fontSize: '1rem',
  overflowWrap: 'anywhere',
} as const;

/**
 * Etiquetas da linha (`×2`, `Repetível`, suplemento). O `COUNT_CHIP_SX`
 * compartilhado tem 16px de altura e fonte `0.6rem` — legível como adorno numa
 * lista compacta, pequeno demais quando carrega informação que decide escolha.
 */
export const EDITOR_CHIP_SX = {
  height: 20,
  fontSize: '0.72rem',
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.75 },
} as const;

/** Texto da descrição do poder, no detalhe expandido. */
export const DESCRIPTION_SX = {
  color: 'text.secondary',
  whiteSpace: 'pre-line',
  fontSize: '0.9rem',
  lineHeight: 1.6,
} as const;

/** Destaque do termo buscado dentro do nome do poder. */
export const HIGHLIGHT_SX = {
  bgcolor: 'warning.main',
  color: 'warning.contrastText',
  borderRadius: '2px',
  px: '1px',
} as const;

/**
 * Cabeçalho de grupo grudado no topo da lista.
 *
 * O `action.hover` do tema é translúcido (rgba), então como cabeçalho sticky
 * ele deixava as linhas passarem por baixo e aparecerem através do texto. A
 * cor de fundo opaca vai no `backgroundColor` e o mesmo tom translúcido é
 * composto por cima como `backgroundImage` — mesmo visual, sem transparência.
 */
export const STICKY_GROUP_HEADER_SX = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  boxSizing: 'border-box',
  px: 1,
  py: 0.75,
  mt: 1,
  borderRadius: 1,
  backgroundColor: 'background.paper',
  backgroundImage: (theme: { palette: { action: { hover: string } } }) =>
    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
} as const;

/** Cabeçalho de grupo do painel direito: ícone + título + contagem. */
export const SELECTED_GROUP_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1,
  py: 0.5,
  mt: 1,
  bgcolor: 'action.hover',
  borderRadius: 1,
} as const;
