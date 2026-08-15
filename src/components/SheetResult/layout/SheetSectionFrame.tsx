/**
 * A moldura de uma seção: o `Card`, o `BookTitle` e a barra flutuante de ações.
 *
 * Deduplica o `sx` de `IconButton` que estava repetido em cinco lugares do
 * `Result`, e centraliza a regra que mais facilmente vira bug: barra sem ação
 * nenhuma NÃO é renderizada. Uma `Stack` posicionada em absoluto com zero
 * filhos ainda ocupa área e engole cliques do conteúdo embaixo — e em modo
 * somente-leitura (ficha de outro jogador na mesa) todas as ações somem.
 */
import React from 'react';
import { Badge, Card, IconButton, Stack, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import BookTitle from '../common/BookTitle';
import { LayoutSection } from '../../../interfaces/SheetLayout';
import { SheetSectionNode } from './sheetSectionTypes';

export interface SheetSectionFrameProps {
  node: SheetSectionNode;
  section: LayoutSection;
  /** `false` quando o frame já está dentro de um card (aba/tela). */
  withCard?: boolean;
  titleColor?: string;
}

export const SheetSectionActions: React.FC<{
  actions: SheetSectionNode['actions'];
}> = ({ actions }) => {
  const theme = useTheme();

  if (actions.length === 0) return null;

  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        position: 'absolute',
        top: -16,
        right: 16,
        zIndex: 1,
      }}
    >
      {actions.map((action) => {
        const active = !!action.highlightColor;
        const button = (
          <IconButton
            size='small'
            disabled={action.disabled}
            onClick={action.onClick}
            sx={{
              backgroundColor: active
                ? action.highlightColor
                : theme.palette.primary.main,
              color: 'white',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: active
                  ? action.highlightColor
                  : theme.palette.primary.dark,
                filter: active ? 'brightness(0.92)' : undefined,
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {action.icon}
          </IconButton>
        );

        const wrapped = action.badgeContent ? (
          <Badge
            badgeContent={action.badgeContent}
            color='error'
            overlap='circular'
          >
            {button}
          </Badge>
        ) : (
          button
        );

        return (
          <Tooltip key={action.key} title={action.tooltip}>
            {/* O `span` é obrigatório quando desabilitado: botão inerte não
                dispara os eventos de mouse que o Tooltip escuta. */}
            {action.disabled ? <span>{wrapped}</span> : wrapped}
          </Tooltip>
        );
      })}
    </Stack>
  );
};

const SheetSectionFrame: React.FC<SheetSectionFrameProps> = ({
  node,
  section,
  withCard = true,
  titleColor,
}) => {
  const title = section.title ?? node.defaultTitle;
  const color = section.titleColor ?? titleColor;

  const content = (
    <>
      {/* Só quem é dono do card desenha a barra. Sem card, a seção está dentro
          de uma aba/tela, e quem agrega as ações de TODAS as seções dali é o
          template — desenhar aqui também duplicaria cada botão. */}
      {withCard && <SheetSectionActions actions={node.actions} />}
      {node.withTitle && <BookTitle color={color}>{title}</BookTitle>}
      {node.body}
    </>
  );

  if (!withCard) return <div>{content}</div>;

  return (
    <Card
      sx={
        node.cardSx ?? {
          p: 3,
          mb: 4,
          position: 'relative',
          overflow: 'visible',
        }
      }
    >
      {content}
    </Card>
  );
};

export default SheetSectionFrame;
