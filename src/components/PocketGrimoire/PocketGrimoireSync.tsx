import React from 'react';
import pocketGrimoireService from '../../services/pocketGrimoire.service';
import { GrimoireSyncService } from '../../store/slices/pocketGrimoire/syncEngine';
import { usePocketGrimoireSync } from './usePocketGrimoireSync';

interface PocketGrimoireSyncProps {
  /** Injetável nos testes. */
  service?: GrimoireSyncService;
}

/** Sincroniza os grimórios com a conta. Não desenha nada. */
const PocketGrimoireSync: React.FC<PocketGrimoireSyncProps> = ({
  service = pocketGrimoireService,
}) => {
  usePocketGrimoireSync(service);
  return null;
};

export default PocketGrimoireSync;
