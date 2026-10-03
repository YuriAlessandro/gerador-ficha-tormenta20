import React from 'react';
import pocketGrimoireService from '../../services/pocketGrimoire.service';
import { GrimoireSyncService } from '../../store/slices/pocketGrimoire/syncEngine';
import { usePocketGrimoireSync } from './usePocketGrimoireSync';
import { useKeepActiveUnlocked } from './useGrimoireLimit';

interface PocketGrimoireSyncProps {
  /** Injetável nos testes. */
  service?: GrimoireSyncService;
}

/**
 * Sincroniza os grimórios com a conta e mantém o ativo fora dos bloqueados.
 * Não desenha nada.
 */
const PocketGrimoireSync: React.FC<PocketGrimoireSyncProps> = ({
  service = pocketGrimoireService,
}) => {
  usePocketGrimoireSync(service);
  useKeepActiveUnlocked();
  return null;
};

export default PocketGrimoireSync;
