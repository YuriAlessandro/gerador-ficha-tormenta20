import React from 'react';

type Props = {
  list: JSX.Element;
  isEmpty: boolean;
  emptyText: string;
};

const SheetPreviewList = ({ list, emptyText, isEmpty }: Props) => {
  if (isEmpty) {
    return <p>{emptyText}</p>;
  }

  return list;
};

export default SheetPreviewList;
