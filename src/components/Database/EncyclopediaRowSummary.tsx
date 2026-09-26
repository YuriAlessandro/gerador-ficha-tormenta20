import React from 'react';
import {
  Box,
  ButtonBase,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface EncyclopediaRowSummaryProps {
  /** Nome do item — também é o botão acessível que expande a linha. */
  name: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Informação curta à direita do nome (ex.: "1º" do círculo da magia). */
  badge?: React.ReactNode;
  /** Etiquetas da segunda linha (tipo, suplemento, variante...). */
  tags?: React.ReactNode;
  /** Ação à direita das etiquetas (ex.: copiar link). Não expande a linha. */
  action?: React.ReactNode;
}

/**
 * Resumo de uma linha da enciclopédia em telas estreitas. Cada informação tem
 * lugar fixo — nome e selo em cima, etiquetas e ação embaixo — em vez de um
 * bloco único que quebra num ponto diferente a cada linha.
 *
 * A linha inteira expande ao toque. Para teclado e leitor de tela, o nome é o
 * botão (com `aria-expanded`); a ação fica fora dele e não propaga o clique.
 */
const EncyclopediaRowSummary: React.FC<EncyclopediaRowSummaryProps> = ({
  name,
  open,
  onToggle,
  badge,
  tags,
  action,
}) => (
  <Box
    onClick={onToggle}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      alignItems: 'center',
      columnGap: 1,
      rowGap: 0.75,
      cursor: 'pointer',
    }}
  >
    <ButtonBase
      aria-expanded={open}
      sx={{
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: 1,
        minWidth: 0,
      }}
    >
      <Typography variant='body1' sx={{ fontWeight: 500 }}>
        {name}
      </Typography>
    </ButtonBase>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {badge && (
        <Typography
          variant='body2'
          component='span'
          sx={{
            fontWeight: 600,
            px: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          {badge}
        </Typography>
      )}
      <KeyboardArrowDownIcon
        aria-hidden
        fontSize='small'
        sx={{
          color: 'text.secondary',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease',
        }}
      />
    </Box>
    {(tags || action) && (
      <>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            '& .MuiChip-root': { height: 22, fontSize: '0.7rem', ml: 0 },
          }}
        >
          {tags}
        </Box>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', justifySelf: 'end' }}
        >
          {action}
        </Box>
      </>
    )}
  </Box>
);

/**
 * Linha de tabela da enciclopédia no mobile: uma célula só, ocupando todas as
 * colunas, com o resumo dentro. A linha de detalhe (Collapse) continua igual.
 */
export const EncyclopediaSummaryRow: React.FC<
  EncyclopediaRowSummaryProps & { colSpan: number }
> = ({ colSpan, name, open, onToggle, badge, tags, action }) => (
  <TableRow>
    <TableCell colSpan={colSpan} sx={{ py: 1.25 }}>
      <EncyclopediaRowSummary
        name={name}
        open={open}
        onToggle={onToggle}
        badge={badge}
        tags={tags}
        action={action}
      />
    </TableCell>
  </TableRow>
);

export default EncyclopediaRowSummary;
