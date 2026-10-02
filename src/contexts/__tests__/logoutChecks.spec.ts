import { describe, it, expect, vi } from 'vitest';
import { createLogoutCheckRegistry } from '../logoutChecks';

describe('createLogoutCheckRegistry', () => {
  it('junta as mensagens de todos os verificadores com pendência', () => {
    const registry = createLogoutCheckRegistry();
    registry.register('sheet', { check: () => true, message: 'Ficha' });
    registry.register('grimorio', { check: () => true, message: 'Grimório' });
    registry.register('limpo', { check: () => false, message: 'Nunca' });
    expect(registry.pendingMessages()).toEqual(['Ficha', 'Grimório']);
  });

  it('remover um não apaga o outro', () => {
    const registry = createLogoutCheckRegistry();
    registry.register('sheet', { check: () => true, message: 'Ficha' });
    registry.register('grimorio', { check: () => true, message: 'Grimório' });
    registry.unregister('sheet');
    expect(registry.pendingMessages()).toEqual(['Grimório']);
  });

  it('registrar de novo com o mesmo id substitui', () => {
    const registry = createLogoutCheckRegistry();
    registry.register('sheet', { check: () => true, message: 'Velha' });
    registry.register('sheet', { check: () => true, message: 'Nova' });
    expect(registry.pendingMessages()).toEqual(['Nova']);
  });

  it('avisa todos no logout', () => {
    const registry = createLogoutCheckRegistry();
    const onLogout = vi.fn();
    registry.register('sheet', { check: () => false, message: 'Ficha' });
    registry.register('grimorio', {
      check: () => false,
      message: 'G',
      onLogout,
    });
    registry.notifyLogout();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
