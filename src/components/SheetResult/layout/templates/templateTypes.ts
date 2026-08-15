import { ResolvedLayout } from '../../../../interfaces/SheetLayout';
import { SheetSectionNodeMap } from '../sheetSectionTypes';

export interface SheetTemplateProps {
  layout: ResolvedLayout;
  nodes: SheetSectionNodeMap;
  /**
   * Usado só para lembrar a aba/tela aberta. Ficha sem id (importada ou
   * legada) simplesmente não tem memória — ver `sheetSurfaceMemory`.
   */
  sheetId: string;
}
