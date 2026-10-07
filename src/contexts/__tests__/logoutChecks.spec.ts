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

  it('prepare chama beforeLogout de todos e espera terminar', async () => {
    const registry = createLogoutCheckRegistry();
    let pending = true;
    registry.register('grimorio', {
      check: () => pending,
      message: 'Grimório',
      beforeLogout: async () => {
        pending = false;
      },
    });
    registry.register('sheet', { check: () => false, message: 'Ficha' });
    await registry.prepare(1000);
    expect(registry.pendingMessages()).toEqual([]);
  });

  it('prepare não espera além do tempo limite', async () => {
    const registry = createLogoutCheckRegistry();
    registry.register('grimorio', {
      check: () => true,
      message: 'Grimório',
      beforeLogout: () => new Promise(() => undefined),
    });
    const started = Date.now();
    await registry.prepare(30);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(registry.pendingMessages()).toEqual(['Grimório']);
  });

  it('prepare ignora falha de um beforeLogout', async () => {
    const registry = createLogoutCheckRegistry();
    registry.register('grimorio', {
      check: () => true,
      message: 'Grimório',
      beforeLogout: () => Promise.reject(new Error('rede')),
    });
    await expect(registry.prepare(1000)).resolves.toBeUndefined();
    expect(registry.pendingMessages()).toEqual(['Grimório']);
  });
});
