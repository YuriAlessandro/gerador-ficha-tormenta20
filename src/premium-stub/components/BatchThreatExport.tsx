/* eslint-disable */
// Stub público — gerado por scripts/generate-premium-stub.mjs.
import { NullComponent, noop } from '../_inert';

export const BatchSelectToolbar = NullComponent;
export const BatchThreatExport = NullComponent;
export const useBatchThreatExport = () => ({
  isSelectMode: false,
  selectedIds: new Set(),
  loadedThreats: [],
  loading: false,
  progress: { current: 0, total: 0 },
  error: null,
  printRef: { current: null },
  toggleSelectMode: noop,
  toggleSelection: noop,
  selectAll: noop,
  clearSelection: noop,
  exportPdf: async () => {},
});
