import { Button } from '@mui/material';
import React, { useState } from 'react';
import SheetBuilderForm from '../SheetBuilder/SheetBuilderForm/SheetBuilderForm';
import SheetPreview from '../SheetBuilder/SheetPreview/SheetPreview';

const SheetBuilderPage: React.FC = () => {
  const [isShowingPreview, setIsShowingPreview] = useState(false);
  const buttonText = isShowingPreview ? 'Voltar a construir' : 'Ver ficha';

  const togglePreview = () => {
    setIsShowingPreview(!isShowingPreview);
  };

  return (
    <div>
      <Button onClick={togglePreview}>{buttonText}</Button>
      <div className={isShowingPreview ? '' : 'hidden'}>
        <SheetPreview />
      </div>
      <div className={isShowingPreview ? 'hidden' : ''}>
        <SheetBuilderForm />
      </div>
    </div>
  );
};
export default SheetBuilderPage;
