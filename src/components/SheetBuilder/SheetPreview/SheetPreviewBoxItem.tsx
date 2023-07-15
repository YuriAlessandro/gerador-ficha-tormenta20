import React, { PropsWithChildren } from 'react';

type Props = {
  title: string;
};

const SheetPreviewBoxItem = ({ title, children }: PropsWithChildren<Props>) => (
  <li className='bg-white rounded-md text-slate-950 px-5 py-3 text-left'>
    <h4 className='font-semibold text-lg text-rose-600'>{title}</h4>
    {children}
  </li>
);

export default SheetPreviewBoxItem;
