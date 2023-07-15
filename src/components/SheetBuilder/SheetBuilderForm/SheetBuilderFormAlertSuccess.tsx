import React from 'react';

type Props = {
  message: string;
};

const SheetBuilderFormAlertSuccess = ({ message }: Props) => (
  <div
    className='bg-green-100 border border-green-400 text-green-700 
      px-4 py-3 rounded relative'
  >
    {message}
  </div>
);

export default SheetBuilderFormAlertSuccess;
