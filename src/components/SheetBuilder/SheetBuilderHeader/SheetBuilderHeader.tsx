import React from 'react';

type Props = {
  isShowingPreview: boolean;
  togglePreview: () => void;
};

const SheetBuilderHeader = ({ togglePreview, isShowingPreview }: Props) => {
  const buttonText = isShowingPreview ? 'Voltar a construir' : 'Ver ficha';

  return (
    <header className='bg-stone-900 flex justify-between items-center'>
      <h1 className='p-4 md:p-5 font-semibold'>T20 Builder</h1>
      <button
        type='button'
        onClick={togglePreview}
        className='
          p-4 md:p-5
          self-stretch  
          text-sm
          border-l
          border-stone-700
          font-bold
          hover:bg-stone-100 hover:text-slate-950
          active:opacity-90'
      >
        {buttonText}
      </button>
    </header>
  );
};

export default SheetBuilderHeader;
