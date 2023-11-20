/* eslint-disable import/prefer-default-export */
import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { selectThreadsByIds } from './selectors';

export const usePostList = (ids) => {
  const posts = useSelector(selectThreadsByIds(ids));

  const sortedIds = useMemo(() => (
    [...posts].sort((a, b) => (b.pinned - a.pinned)).map((post) => post.id)
  ), [posts]);

  return sortedIds;
};
