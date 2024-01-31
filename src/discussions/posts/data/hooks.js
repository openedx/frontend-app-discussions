import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { selectThreadsByIds } from './selectors';

const usePostList = (ids) => {
  const posts = useSelector(selectThreadsByIds(ids));
  const pinnedPostsIds = [];
  const unpinnedPostsIds = [];

  const sortedIds = useMemo(() => {
    posts.forEach((post) => {
      if (post.pinned) {
        pinnedPostsIds.push(post.id);
      } else {
        unpinnedPostsIds.push(post.id);
      }
    });

    return [...pinnedPostsIds, ...unpinnedPostsIds];
  }, [posts]);

  return sortedIds;
};

export default usePostList;
