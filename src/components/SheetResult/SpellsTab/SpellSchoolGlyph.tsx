import React from 'react';
import { Tooltip } from '@mui/material';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';
import { getSchoolVisual, useSchoolColor } from './spellSchoolVisuals';
import { SCHOOL_GLYPH_SIZE } from './spellsTabStyles';

interface SpellSchoolGlyphProps {
  school: string;
  /**
   * Glifos do game-icons são desenhos de 512px com bastante detalhe. Abaixo do
   * padrão viram borrão — não reduzir sem olhar o resultado. O padrão mora em
   * `spellsTabStyles` porque o recuo da meta-line é derivado dele.
   */
  size?: number;
  /** `false` apaga a cor: usado pelos toggles de filtro quando desligados. */
  active?: boolean;
  /** O toggle de filtro já tem o próprio tooltip com o nome da escola. */
  disableTooltip?: boolean;
}

/**
 * O indicador de escola: um glifo temático na cor da escola.
 *
 * Substitui a coluna "Escola" da tabela antiga, que num container estreito
 * truncava para "N.." e não informava nada. Um glifo ocupa 18px fixos e é
 * reconhecível de relance.
 */
const SpellSchoolGlyph: React.FC<SpellSchoolGlyphProps> = ({
  school,
  size = SCHOOL_GLYPH_SIZE,
  active = true,
  disableTooltip = false,
}) => {
  const color = useSchoolColor(school);
  const { icon: Icon } = getSchoolVisual(school);

  const glyph = (
    <Icon
      sx={{
        fontSize: size,
        flexShrink: 0,
        color: active ? color : 'text.disabled',
      }}
    />
  );

  if (disableTooltip) return glyph;

  return (
    <Tooltip title={getSchoolLabel(school)} arrow disableInteractive>
      {glyph}
    </Tooltip>
  );
};

export default SpellSchoolGlyph;
