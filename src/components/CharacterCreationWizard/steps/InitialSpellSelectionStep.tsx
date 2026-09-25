import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Spell, SpellSchool } from '@/interfaces/Spells';
import { CrossTraditionRules } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { buildSpellPool } from '@/functions/spellPathUtils';
import { SupplementId } from '@/types/supplement.types';
import SpellCardPicker from '@/components/SpellPicker/SpellCardPicker';

interface InitialSpellSelectionStepProps {
  selectedSpells: Spell[];
  onChange: (spells: Spell[]) => void;
  requiredCount: number;
  className: string;
  spellType: 'Arcane' | 'Divine' | 'Both';
  schools?: SpellSchool[];
  excludeSchools?: SpellSchool[];
  includeDivineSchools?: SpellSchool[];
  includeArcaneSchools?: SpellSchool[];
  crossTraditionLimit?: number;
  crossTraditionRules?: CrossTraditionRules;
  /** Linhagem Abençoada: ao menos N das magias iniciais têm que ser divinas. */
  minCrossTraditionSpells?: number;
  supplements?: SupplementId[];
}

const InitialSpellSelectionStep: React.FC<InitialSpellSelectionStepProps> = ({
  selectedSpells,
  onChange,
  requiredCount,
  className,
  spellType,
  schools,
  excludeSchools,
  includeDivineSchools,
  includeArcaneSchools,
  crossTraditionLimit,
  crossTraditionRules,
  minCrossTraditionSpells = 0,
  supplements = [SupplementId.TORMENTA20_CORE],
}) => {
  // Get available spells based on type, schools, and supplements
  const { availableSpells, crossTraditionSpellNames, traditionNames } =
    useMemo(() => {
      // Magias iniciais são sempre de 1º círculo. O pool sai do mesmo builder da
      // geração aleatória e do wizard de evolução — três implementações
      // separadas divergiam.
      const { spells, crossNames } = buildSpellPool({
        spellPath: {
          spellType,
          schools,
          excludeSchools,
          includeDivineSchools,
          includeArcaneSchools,
          crossTraditionLimit,
          crossTraditionRules,
        },
        maxCircle: 1,
        supplements,
      });

      // Tradition name sets, used by the "Tipo" filter when spellType is 'Both'.
      const spellsByCircle =
        dataRegistry.getSpellsCircle1BySupplements(supplements);
      const allArcaneNames = new Set<string>(
        (Object.values(spellsByCircle.arcane) as Spell[][])
          .flat()
          .map((s) => s.nome)
      );
      const allDivineNames = new Set<string>(
        (Object.values(spellsByCircle.divine) as Spell[][])
          .flat()
          .map((s) => s.nome)
      );

      // Sort alphabetically
      return {
        availableSpells: [...spells].sort((a, b) =>
          a.nome.localeCompare(b.nome)
        ),
        crossTraditionSpellNames: crossNames,
        traditionNames: { arcane: allArcaneNames, divine: allDivineNames },
      };
    }, [
      spellType,
      schools,
      excludeSchools,
      includeDivineSchools,
      includeArcaneSchools,
      crossTraditionLimit,
      crossTraditionRules,
      supplements,
    ]);

  const handleToggle = (spell: Spell) => {
    const isSelected = selectedSpells.some((s) => s.nome === spell.nome);
    if (isSelected) {
      onChange(selectedSpells.filter((s) => s.nome !== spell.nome));
    } else if (selectedSpells.length < requiredCount) {
      onChange([...selectedSpells, spell]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        A classe {className} permite escolher {requiredCount} magia
        {requiredCount > 1 ? 's' : ''} de 1º círculo
        {schools && schools.length > 0
          ? ` das escolas: ${schools.join(', ')}`
          : ''}
        .
      </Typography>
      <SpellCardPicker
        availableSpells={availableSpells}
        selectedSpells={selectedSpells}
        requiredCount={requiredCount}
        onToggle={handleToggle}
        crossTraditionSpellNames={crossTraditionSpellNames}
        crossTraditionLabel={spellType === 'Arcane' ? 'Divina' : 'Arcana'}
        crossTraditionLimit={crossTraditionLimit}
        minCrossTraditionSpells={minCrossTraditionSpells}
        // A tradição só faz sentido para quem escolhe das duas listas.
        traditionNames={spellType === 'Both' ? traditionNames : undefined}
        emptyMessage='Nenhuma magia disponível. Isso pode ser um erro de configuração.'
      />
    </Box>
  );
};

export default InitialSpellSelectionStep;
