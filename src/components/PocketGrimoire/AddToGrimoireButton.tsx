import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useAddToGrimoire } from './useAddToGrimoire';

interface Props {
  itemId: string;
  itemName: string;
  /** Sem ele, age sobre o grimório ativo. */
  grimoireId?: string;
  /**
   * `icon` (padrão): ícone compacto, para linhas e listas.
   * `labeled`: botão com texto e o nome do grimório de destino, para o
   * detalhe expandido e cabeçalhos — é o que o usuário não pode deixar de ver.
   */
  variant?: 'icon' | 'labeled';
}

const AddToGrimoireButton: React.FC<Props> = ({
  itemId,
  itemName,
  grimoireId,
  variant = 'icon',
}) => {
  const { inGrimoire, label, targetName, toggle } = useAddToGrimoire(
    itemId,
    itemName,
    grimoireId
  );

  const handleClick = (event: React.MouseEvent) => {
    // O botão vive dentro de linhas de tabela e resultados de busca clicáveis.
    event.stopPropagation();
    toggle();
  };

  if (variant === 'labeled') {
    return (
      <Tooltip describeChild title={inGrimoire ? 'Clique para remover' : ''}>
        <Button
          size='small'
          variant={inGrimoire ? 'contained' : 'outlined'}
          color={inGrimoire ? 'success' : 'primary'}
          startIcon={
            inGrimoire ? <BookmarkAddedIcon /> : <BookmarkAddOutlinedIcon />
          }
          onClick={handleClick}
          onMouseDown={(event) => event.stopPropagation()}
          sx={{ textTransform: 'none', maxWidth: '100%' }}
        >
          {inGrimoire
            ? `No grimório "${targetName}"`
            : `Adicionar ao grimório "${targetName}"`}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        size='small'
        color={inGrimoire ? 'success' : 'default'}
        onClick={handleClick}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {inGrimoire ? (
          <BookmarkAddedIcon fontSize='small' />
        ) : (
          <BookmarkAddOutlinedIcon fontSize='small' />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default AddToGrimoireButton;
