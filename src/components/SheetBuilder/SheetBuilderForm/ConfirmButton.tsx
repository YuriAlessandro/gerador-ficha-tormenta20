import React from 'react';

type Props = {
  confirm(): void;
};

const ConfirmButton = ({ confirm }: Props) => (
  <button
    onClick={ confirm }
    type='button'
    className='
          bg-white px-8 py-3 mb-3 rounded-2xl 
          text-slate-900 font-bold 
          transition-colors
          hover:opacity-95
          active:scale-105'
  >
    Confirmar
  </button>
);

export default ConfirmButton;
