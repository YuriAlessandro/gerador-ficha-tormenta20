import { describe, it, expect, vi } from 'vitest';
import { buildNavCategories } from '../NavbarV2';

// O menu do usuário puxa um leitor de markdown que não carrega no vitest.
vi.mock('../../Auth/UserMenu', () => ({ default: () => null }));

describe('categorias do navbar', () => {
  it.each([false, true])(
    '"Consulta" leva ao Grimório de bolso (logado: %s)',
    (isAuthenticated) => {
      const consulta = buildNavCategories(isAuthenticated).find(
        (category) => category.label === 'Consulta'
      );
      expect(
        consulta?.items?.map(({ label, link }) => ({ label, link }))
      ).toContainEqual({ label: 'Grimório de bolso', link: '/grimorio' });
    }
  );
});
