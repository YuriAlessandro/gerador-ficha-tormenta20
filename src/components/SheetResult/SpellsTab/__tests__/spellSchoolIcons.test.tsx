import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { allSpellSchools } from '@/interfaces/Spells';
import { SCHOOL_VISUALS, getSchoolVisual } from '../spellSchoolVisuals';

/** O quadrado de fundo dos SVGs do game-icons. */
const BACKGROUND_PATH = 'M0 0h512v512H0z';

describe('glifos das escolas de magia', () => {
  it('cobre todas as escolas do sistema', () => {
    allSpellSchools.forEach((school) => {
      expect(SCHOOL_VISUALS[school]).toBeDefined();
    });
  });

  it('não inclui o path de fundo do game-icons', () => {
    // Cada SVG original tem DOIS paths: o quadrado preto de fundo e o glifo.
    // Copiar o arquivo inteiro renderiza um quadrado sólido no lugar do ícone —
    // é o erro mais fácil de cometer ao trocar ou adicionar um glifo.
    allSpellSchools.forEach((school) => {
      const Icon = SCHOOL_VISUALS[school].icon;
      const { container, unmount } = render(<Icon />);
      const paths = Array.from(container.querySelectorAll('path'));

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((path) => {
        expect(path.getAttribute('d')?.trim()).not.toBe(BACKGROUND_PATH);
      });
      unmount();
    });
  });

  it('cai num glifo neutro para escola desconhecida', () => {
    // Magia personalizada aceita escola em texto livre.
    const visual = getSchoolVisual('Cronomancia');
    expect(visual.icon).toBeDefined();
    expect(visual.light).toBeTruthy();
    expect(visual.dark).toBeTruthy();
  });

  it('dá uma cor distinta para cada escola em ambos os temas', () => {
    const light = allSpellSchools.map((s) => SCHOOL_VISUALS[s].light);
    const dark = allSpellSchools.map((s) => SCHOOL_VISUALS[s].dark);

    expect(new Set(light).size).toBe(allSpellSchools.length);
    expect(new Set(dark).size).toBe(allSpellSchools.length);
  });
});
