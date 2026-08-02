// sx em nível de módulo: uma ficha de conjurador chega fácil a 40 magias e cada
// objeto inline força o emotion a re-serializar o estilo.
//
// O vocabulário base (linha, grupo, toolbar) vem de `../common/listStyles`, o
// mesmo da aba de Poderes. Aqui moram só as peças que são de magia.

/**
 * A linha da magia empilha nome e metadados, então o conteúdo é uma COLUNA
 * dentro da linha — diferente de Poderes, onde tudo cabe numa fileira só.
 */
export const SPELL_CONTENT_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
  flex: 1,
  minWidth: 0,
  py: 0.5,
} as const;

/** Tamanho do glifo de escola. Piso de legibilidade dos desenhos do game-icons. */
export const SCHOOL_GLYPH_SIZE = 18;

/**
 * Largura fixa do rail do Mago. Fixa porque o conteúdo varia — magia sempre
 * preparada mostra só o alfinete, as outras mostram caixa + alfinete — e sem
 * uma largura os nomes ficariam desalinhados entre linhas da mesma lista.
 */
export const MAGO_RAIL_WIDTH = 44;

export const NAME_LINE_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  flexWrap: 'wrap',
  minWidth: 0,
} as const;

/**
 * O glifo e o rail do Mago são irmãos do bloco de conteúdo, e SEM `alignSelf`
 * nem `margin-top`: o `alignItems: 'center'` da linha já os centraliza em
 * relação ao bloco inteiro — nome MAIS meta-line.
 *
 * Alinhar com a linha do nome (que é o que um `alignSelf: 'flex-start'` faz)
 * parece desalinhado justamente porque existe a segunda linha embaixo: o olho
 * lê o glifo contra a caixa toda, não contra o título.
 *
 * O `mr` fecha a conta na horizontal. A linha já dá 8px de recuo à esquerda
 * (`px: 1` do `ROW_SX`) mas só 4px de `gap` até o nome — o glifo ficava colado
 * no texto e lia como empurrado para a direita. Com mais 4px de margem os dois
 * lados empatam em 8px e ele ocupa uma calha própria.
 */
export const SCHOOL_GLYPH_WRAP_SX = {
  display: 'flex',
  flexShrink: 0,
  mr: 0.5,
} as const;

export const MAGO_RAIL_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.25,
  flexShrink: 0,
  width: MAGO_RAIL_WIDTH,
} as const;

/**
 * `NAME_SX` do vocabulário compartilhado usa `flex: 1` porque em Poderes é o
 * nome que empurra o rail de ações para a direita. Aqui o rail é irmão do bloco
 * inteiro, não do nome — manter `flex: 1` jogaria "Personalizada" e o atributo-
 * chave para a borda oposta da linha, longe do nome que eles qualificam.
 * `0 1 auto` deixa o nome ocupar só o que precisa e ainda encolher.
 */
export const SPELL_NAME_SX = {
  flex: '0 1 auto',
  minWidth: 0,
  fontWeight: 700,
  color: 'primary.main',
  fontSize: '0.9rem',
  overflowWrap: 'anywhere',
} as const;

/**
 * O coração do redesenho.
 *
 * A tabela antiga dava a cada campo uma coluna de largura fixa, então num
 * container estreito "Padrão" virava "Pad…" e "1 objeto" virava "1 obje…" —
 * sete colunas competindo por um card que vive numa coluna de 60%, embutido
 * ainda no iframe do Owlbear e no widget da tela do mestre.
 *
 * Aqui os campos viram tokens que QUEBRAM: `flexWrap` mais `flexShrink: 0` em
 * cada token significa que o texto nunca é cortado — a linha só ocupa mais
 * altura. Em ~900px cabe tudo numa linha; em ~340px vira três. Nenhuma reticência.
 */
export const META_LINE_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: 1,
  rowGap: 0.25,
  minWidth: 0,
  fontSize: '0.7rem',
  color: 'text.secondary',
  lineHeight: 1.5,
} as const;

/**
 * `flexShrink: 0` é o que faz o token quebrar para a linha de baixo em vez de
 * espremer. `overflowWrap` é a válvula de escape para um alvo muito longo
 * ("Criaturas escolhidas em uma esfera de 9m de raio") num container minúsculo:
 * aí o token quebra internamente, ainda sem truncar.
 */
export const META_ITEM_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.25,
  flexShrink: 0,
  maxWidth: '100%',
  minWidth: 0,
  overflowWrap: 'anywhere',
} as const;

export const META_ICON_SX = {
  fontSize: 13,
  opacity: 0.75,
  flexShrink: 0,
} as const;

/** Micro-chip: "Personalizada", atributo-chave próprio, PM fora da regra. */
export const MICRO_CHIP_SX = {
  height: 16,
  fontSize: '0.6rem',
  flexShrink: 0,
  '& .MuiChip-label': { px: 0.625 },
} as const;

export const CIRCLE_PM_SX = {
  color: 'text.secondary',
  flexShrink: 0,
  fontSize: '0.8rem',
} as const;

/** Fileira dos oito glifos de escola dentro do popover de filtros. */
export const SCHOOL_TOGGLE_ROW_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.25,
  mt: 0.5,
} as const;

export const FILTER_POPOVER_SX = {
  p: 2,
  width: 280,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
} as const;

export const DETAIL_SECTION_SX = { mt: 2 } as const;

export const DETAIL_LABEL_SX = {
  fontWeight: 700,
  color: 'text.secondary',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  mb: 0.5,
} as const;

export const ROLL_CHIP_SX = { height: 20, fontSize: '0.7rem' } as const;
