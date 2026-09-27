/**
 * O contrato entre o `Result` (que sabe montar cada bloco da ficha) e os
 * templates (que sabem onde os blocos vão).
 *
 * A peça que exige cuidado é `actions`. Antes da existência de layout, os
 * ícones flutuantes do canto do card eram do CARD DE ABAS e mudavam conforme a
 * aba ativa — inclusive um lápis com um `if/else` decidindo qual drawer abrir.
 * Isso só funcionava porque havia exatamente um card de abas, com uma seção por
 * aba. Com regiões configuráveis (uma tela pode juntar Ataques e Defesa) a
 * pergunta "quais botões mostrar" deixa de ter resposta global: cada seção
 * declara os seus, e o frame que a envolve renderiza os dela.
 */
import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * As seções em que a ficha se divide. O sistema de layouts configuráveis (no
 * submódulo premium) posiciona estas mesmas seções e mantém uma cópia desta
 * lista no contrato dele; um teste de lá garante que as duas não divergem.
 */
export const SHEET_SECTION_KINDS = [
  'identity',
  'attributes',
  'skills',
  'attacks',
  'defense',
  'powers',
  'spells',
  'equipment',
  'proficiencies',
  'sizeDisplacement',
  'partners',
  'animalCompanions',
  'journal',
  'creationSteps',
  'supportCta',
  'bugReport',
  'note',
] as const;

export type SheetSectionKind = (typeof SHEET_SECTION_KINDS)[number];

export interface SheetSectionAction {
  /** Estável por ação; usado como `key` do React e para deduplicar. */
  key: string;
  icon: React.ReactNode;
  tooltip: string;
  /** Contador do `Badge` (ex.: efeitos ativos). `0`/ausente esconde o badge. */
  badgeContent?: number;
  /** Cor de destaque quando a ação está "acesa". */
  highlightColor?: string;
  /** Botão visível mas inerte (ex.: subir nível numa ficha de nível 20). */
  disabled?: boolean;
  onClick: () => void;
}

export interface SheetSectionNode {
  kind: SheetSectionKind;
  /** Rótulo padrão; o layout pode sobrescrever com `section.title`. */
  defaultTitle: string;
  /** Ícone padrão (`mui:<Nome>` ou `gi:<autor>/<nome>`), usado pelo editor de layout. */
  iconKey: string;
  /** Corpo já renderizado — memoizado por quem monta. */
  body: React.ReactNode;
  /**
   * Vazio em modo somente-leitura. O frame NÃO renderiza a barra quando não há
   * ação: uma `Stack` absoluta vazia vira um retângulo invisível capturando
   * cliques em cima do conteúdo.
   */
  actions: SheetSectionAction[];
  /** Nem toda seção tem `BookTitle` (identidade, defesa e vitais não têm). */
  withTitle: boolean;
  /**
   * A seção já traz o próprio container e NÃO deve ser embrulhada num `Card`.
   *
   * É o caso dos painéis que se auto-desenham (Parceiros, Companheiros) e dos
   * blocos do rodapé (alerta de bug, CTA de apoio, passo-a-passo): todos já
   * vêm com `Alert`/`Accordion`/painel próprio, e um card em volta criaria uma
   * moldura dentro da outra.
   */
  selfContained?: boolean;
  /**
   * Sobrescreve o `sx` do card. Existe porque nem todo bloco usava o mesmo
   * padding: identidade tinha `p` responsivo e altura mínima, proficiências e
   * tamanho/deslocamento usavam `p: 2`. Preservar isso é o que mantém a ficha
   * pixel a pixel igual à de antes do sistema de layout.
   */
  cardSx?: SxProps<Theme>;
  /** `false` some do render e do editor (ex.: Magias numa ficha sem conjurador). */
  available: boolean;
}

export type SheetSectionNodeMap = Partial<
  Record<SheetSectionKind, SheetSectionNode>
>;

/** Seções que esta ficha tem, no formato que o `resolveLayout` espera. */
export const availableKindsOf = (
  nodes: SheetSectionNodeMap
): Set<SheetSectionKind> =>
  new Set(
    (Object.keys(nodes) as SheetSectionKind[]).filter(
      (kind) => nodes[kind]?.available
    )
  );

/**
 * Ações de todas as seções visíveis de uma região, deduplicadas por `key`.
 *
 * Usado quando a região inteira compartilha um card (uma aba, uma tela do menu
 * de ação): aí a barra é do card, e as seções lá dentro não desenham a sua —
 * senão o mesmo botão apareceria duas vezes.
 */
export const collectRegionActions = (
  region: { sections: { payload: { kind: SheetSectionKind } }[] } | undefined,
  nodes: SheetSectionNodeMap
): SheetSectionAction[] => {
  if (!region) return [];

  const seen = new Set<string>();
  return region.sections.flatMap((section) => {
    const node = nodes[section.payload.kind];
    if (!node?.available) return [];
    return node.actions.filter((action) => {
      if (seen.has(action.key)) return false;
      seen.add(action.key);
      return true;
    });
  });
};
