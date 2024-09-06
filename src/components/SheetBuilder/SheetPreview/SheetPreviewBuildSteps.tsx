/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import { useSelector } from 'react-redux';
import React from 'react';
import { selectPreviewBuildSteps } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Dialog, Paper, Slide, Stack } from '@mui/material';
import { TransitionProps } from 'react-transition-group/Transition';
import { useParams } from 'react-router';

const Transition = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) => <Slide direction='up' ref={ref} {...props} />
);

const SheetPreviewBuildSteps: React.FC<{
  open: boolean;
  handleClose: () => void;
}> = ({ open, handleClose }) => {
  const params = useParams<{ id: string }>();
  const buildSteps = useSelector(selectPreviewBuildSteps(params.id));

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <Stack spacing={2} p={2}>
        {buildSteps.length === 0 && (
          <p>Você ainda não adicionou detalhes a esta ficha.</p>
        )}
        {buildSteps.map((step, index) => {
          const [title, ...text] = step.action.description.split(':');

          return (
            <Paper
              key={`${step.action.type}-${step.action.description}`}
              sx={{ p: 2 }}
              elevation={2}
            >
              <span className='font-medium text-rose-600'>
                {index + 1} - {title}:{' '}
              </span>
              {text.join('')}
            </Paper>
          );
        })}
      </Stack>
    </Dialog>
  );
};

export default SheetPreviewBuildSteps;
