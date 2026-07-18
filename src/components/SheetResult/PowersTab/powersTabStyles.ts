// sx em nível de módulo: a ficha pode ter dezenas de poderes e cada objeto
// inline força o emotion a re-serializar o estilo.

/** Curva de saída forte. As easings nativas do CSS são fracas demais. */
export const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Accordion do desktop. Abaixo de 300ms para não parecer arrastado. */
export const DETAIL_TIMEOUT = 220;

export const GROUP_HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1,
  py: 0.5,
  mt: 1,
  bgcolor: 'action.hover',
  borderRadius: 1,
} as const;

export const GROUP_TITLE_SX = {
  fontWeight: 700,
  flex: 1,
  minWidth: 0,
} as const;
export const GROUP_COUNT_SX = {
  color: 'text.secondary',
  flexShrink: 0,
} as const;

/**
 * A linha inteira. `minHeight: 44` garante o alvo de toque mínimo mesmo quando
 * o nome cabe numa linha só.
 */
export const ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  width: '100%',
  minHeight: 44,
  px: 1,
  textAlign: 'left',
  borderBottom: '1px solid',
  borderColor: 'divider',
  transition: `transform 140ms ${EASE_OUT}, background-color 140ms ${EASE_OUT}`,
  '&:active': { transform: 'scale(0.99)' },
  // Toque dispara :hover no tap e gera falso positivo.
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': { bgcolor: 'action.hover' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:active': { transform: 'none' },
  },
} as const;

/**
 * O conserto do bug de layout: o nome tinha `flexShrink: 0` dentro de um flex
 * `space-between`, então se recusava a encolher e espremia o rótulo de tipo à
 * direita, que quebrava em duas linhas coladas no nome. Agora o nome é o único
 * elemento elástico e tudo mais tem `flexShrink: 0`.
 *
 * Sem `noWrap`/ellipsis de propósito: nomes de poder em PT-BR são longos e
 * truncá-los esconde justamente o que diferencia um poder do outro.
 */
export const NAME_SX = {
  flex: 1,
  minWidth: 0,
  fontWeight: 700,
  color: 'primary.main',
  fontSize: '0.9rem',
  overflowWrap: 'anywhere',
} as const;

/** Ícones de ação, sempre à direita, para a borda esquerda do texto ficar reta. */
export const ACTION_RAIL_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
  flexShrink: 0,
} as const;

export const CHEVRON_SX = {
  color: 'text.secondary',
  flexShrink: 0,
} as const;

export const COUNT_CHIP_SX = {
  height: 16,
  fontSize: '0.6rem',
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.625 },
} as const;

export const EMPTY_SX = { color: 'text.secondary', py: 2 } as const;

/** Busca + chips de filtro grudados no topo enquanto a lista rola. */
export const TOOLBAR_SX = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  bgcolor: 'background.paper',
  borderBottom: '1px solid',
  borderColor: 'divider',
  pb: 1.5,
  // Modesto de propósito: o primeiro cabeçalho de grupo já traz `mt: 1`, então
  // um `mb` grande aqui viraria um buraco entre a borda e o primeiro grupo.
  mb: 1,
} as const;

/**
 * No mobile os chips rolam na horizontal: com 6-10 grupos, deixar quebrar
 * comeria três linhas da tela antes do primeiro poder aparecer.
 *
 * `rowGap` maior que `columnGap` de propósito: quando os chips quebram em duas
 * linhas, é a distância vertical que decide se as linhas se leem como blocos
 * separados ou como um bloco só embolado.
 */
export const CHIP_SCROLLER_SX = {
  display: 'flex',
  columnGap: 0.75,
  rowGap: 1,
  overflowX: 'auto',
  flexWrap: { xs: 'nowrap', sm: 'wrap' },
  mt: 1.5,
  pb: 0.5,
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: 'action.disabled',
    borderRadius: 2,
  },
} as const;

export const FILTER_CHIP_SX = { flexShrink: 0 } as const;
