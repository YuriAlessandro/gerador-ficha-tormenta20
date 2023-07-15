import React from 'react';

type Props = {
  label: string;
  value: number;
};

const SheetPreviewItem = ({ label, value }: Props) => (
  <div className='flex flex-col'>
    <label htmlFor={`${label}-preview-item`} className='text-sm mb-2'>
      {label}
    </label>
    <div
      className='border border-white rounded-2xl font-bold px-5 py-1'
      id={`${label}-preview-item`}
    >
      {value}
    </div>
  </div>
);

export default SheetPreviewItem;
