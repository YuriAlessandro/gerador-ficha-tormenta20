import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useAddToGrimoire } from './useAddToGrimoire';

interface Props {
  itemId: string;
  itemName: string;
  /** Categoria e subtítulo da entrada, já formatados. */
  secondary: string;
  grimoireId: string;
}

/**
 * Resultado da busca na enciclopédia dentro de um grimório: a linha toda
 * guarda e devolve o item. O alvo largo é o que torna a adição em sequência
 * tolerável no celular.
 *
 * O marcador aqui é só estado, não um segundo botão: com a linha agindo, um
 * `IconButton` seria um controle repetido com o mesmo rótulo — e, posicionado
 * por cima da linha, deixaria um canto morto ao clique.
 */
const AddFromEncyclopediaItem: React.FC<Props> = ({
  itemId,
  itemName,
  secondary,
  grimoireId,
}) => {
  const { inGrimoire, label, toggle } = useAddToGrimoire(
    itemId,
    itemName,
    grimoireId
  );

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={toggle} aria-label={label}>
        <ListItemText primary={itemName} secondary={secondary} />
        <ListItemIcon
          sx={{ minWidth: 0, color: inGrimoire ? 'success.main' : undefined }}
        >
          {inGrimoire ? (
            <BookmarkAddedIcon fontSize='small' />
          ) : (
            <BookmarkAddOutlinedIcon fontSize='small' />
          )}
        </ListItemIcon>
      </ListItemButton>
    </ListItem>
  );
};

export default AddFromEncyclopediaItem;
