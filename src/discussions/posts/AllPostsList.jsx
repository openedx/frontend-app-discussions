import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { selectAllThreadsIds } from './data/selectors';
import PostsList from './PostsList';

const AllPostsList = () => {
  const postsIds = useSelector(selectAllThreadsIds);

  return <PostsList postsIds={postsIds} topicsIds={null} />;
};

export default memo(AllPostsList);
