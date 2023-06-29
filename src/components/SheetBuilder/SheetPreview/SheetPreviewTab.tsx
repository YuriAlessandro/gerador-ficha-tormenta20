import React, { PropsWithChildren } from 'react';

const SheetPreviewTab = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => (
  <div className='py-2 px-5'>{children}</div>
);

export default SheetPreviewTab;
