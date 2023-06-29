import React, { ComponentProps, PropsWithChildren } from 'react';

type Props = {
  onClick: () => void;
  side: 'left' | 'right';
};

const AttributeInputButton = ({
  onClick,
  children,
  side,
}: PropsWithChildren<Props>) => {
  const sidesClasses = {
    left: 'rounded-tl-2xl rounded-bl-2xl',
    right: 'rounded-tr-2xl rounded-br-2xl',
  };

  return (
    <button
      type='button'
      onClick={onClick}
      className={`${sidesClasses[side]} bg-white text-slate-900 px-3 py-2
      hover:bg-stone-100 active:opacity-90`}
    >
      {children}
    </button>
  );
};

export default AttributeInputButton;
