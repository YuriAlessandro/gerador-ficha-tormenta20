/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.
//
// Sem o submódulo premium não há layouts configuráveis: a ficha usa o arranjo
// fixo público, sem fundo de layout e sem o botão "Editar layout da ficha".
import React from 'react';

import DefaultSheetArrangement from '@/components/SheetResult/sections/DefaultSheetArrangement';
import { SheetSectionNodeMap } from '@/components/SheetResult/sections/sheetSectionTypes';

export interface SheetLayoutViewState {
  enabled: boolean;
  needsSupport: boolean;
  layout?: undefined;
  backgroundCss?: string;
  backgroundOpacity: number;
}

const DISABLED: SheetLayoutViewState = {
  enabled: false,
  needsSupport: false,
  backgroundOpacity: 0,
};

export const useSheetLayoutView = (..._args: unknown[]): SheetLayoutViewState =>
  DISABLED;

export const SheetLayoutArea: React.FC<{
  view: SheetLayoutViewState;
  nodes: SheetSectionNodeMap;
  sheetId: string;
  forceSurface?: 'desktop' | 'mobile';
}> = ({ nodes, forceSurface }) => (
  <DefaultSheetArrangement nodes={nodes} forceSurface={forceSurface} />
);

export const SheetLayoutEditButton: React.FC<Record<string, unknown>> = () =>
  null;
