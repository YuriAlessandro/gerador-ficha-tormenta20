import React from 'react';
import '../assets/css/result.css';

interface DividerProp {
  direction: string;
}

const Divider: React.FC<DividerProp> = (props) => {
  const { direction } = props;
  return <div className={`divider div-transparent div-arrow-${direction}`} />;
};

export default Divider;
