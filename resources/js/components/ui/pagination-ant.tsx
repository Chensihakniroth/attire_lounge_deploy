import React from 'react';
import { Pagination, PaginationProps } from 'antd';

const PaginationAnt: React.FC<PaginationProps> = (props) => {
  return <Pagination {...props} />;
};

export default PaginationAnt;
