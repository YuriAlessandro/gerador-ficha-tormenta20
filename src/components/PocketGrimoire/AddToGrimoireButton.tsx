import React, { useState } from 'react';
import { Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useAddToGrimoire } from './useAddToGrimoire';
import GrimoireChoiceMenu from './GrimoireChoiceMenu';

interface Props {
  itemId: string;
  itemName: string;
  /** Sem ele, age sobre o grimório ativo. */
  grimoireId?: string;
  /**
   * `icon` (padrão): ícone compacto, para linhas e listas.
   * `labeled`: botão com texto e o nome do grimório de destino, para o
   * detalhe expandido e cabeçalhos — é o que o usuário não pode deixar de ver.
   * A seta ao lado escolhe outro grimório (`GrimoireChoiceMenu`).
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

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent) => {
    // O botão vive dentro de linhas de tabela e resultados de busca clicáveis.
    event.stopPropagation();
    toggle();
  };

  if (variant === 'labeled') {
    return (
      <>
        <ButtonGroup
          size='small'
          variant={inGrimoire ? 'contained' : 'outlined'}
          color={inGrimoire ? 'success' : 'primary'}
          sx={{ maxWidth: '100%' }}
        >
          <Tooltip
            describeChild
            title={inGrimoire ? 'Clique para remover' : ''}
          >
            <Button
              startIcon={
                inGrimoire ? <BookmarkAddedIcon /> : <BookmarkAddOutlinedIcon />
              }
              onClick={handleClick}
              onMouseDown={(event) => event.stopPropagation()}
              sx={{ textTransform: 'none', minWidth: 0 }}
            >
              {inGrimoire
                ? `No grimório "${targetName}"`
                : `Adicionar ao grimório "${targetName}"`}
            </Button>
          </Tooltip>
          <Button
            aria-label='Escolher grimório'
            aria-haspopup='menu'
            aria-expanded={menuAnchor !== null}
            onClick={(event) => {
              event.stopPropagation();
              setMenuAnchor(event.currentTarget);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={{ px: 0.5, minWidth: 0 }}
          >
            <ArrowDropDownIcon fontSize='small' />
          </Button>
        </ButtonGroup>
        <GrimoireChoiceMenu
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          itemId={itemId}
          itemName={itemName}
        />
      </>
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
