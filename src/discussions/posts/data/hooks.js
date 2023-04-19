/* eslint-disable import/prefer-default-export */
import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { selectThreadsByIds } from './selectors';

export const usePostList = (ids) => {
  const posts = useSelector(selectThreadsByIds(ids));
  const pinnedPostsIds = [];
  const unpinnedPostsIds = [];

  useMemo(() => {
    posts.forEach((post) => {
      if (post.pinned) {
        pinnedPostsIds.push(post.id);
      } else {
        unpinnedPostsIds.push(post.id);
      }
    });
  }, [posts]);

  return [...pinnedPostsIds, ...unpinnedPostsIds];
};
