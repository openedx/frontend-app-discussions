import React, { memo, useMemo } from 'react';

import { useCategory, useTopicId } from '../data/hooks';
import { handleKeyDown } from '../utils';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import AllPostsList from './AllPostsList';
import CategoryPostsList from './CategoryPostsList';
import PostsSearchInfo from './PostsSearchInfo';
import TopicPostsList from './TopicPostsList';

const PostsView = () => {
  const topicId = useTopicId();
  const category = useCategory();

  const postsListComponent = useMemo(() => {
    if (topicId) {
      return <TopicPostsList />;
    }
    if (category) {
      return <CategoryPostsList />;
    }
    return <AllPostsList />;
  }, [topicId, category]);

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      <PostsSearchInfo />
      <PostFilterBar />
      <div className="border-bottom border-light-400" />
      <div className="list-group list-group-flush flex-fill" role="list" onKeyDown={e => handleKeyDown(e)}>
        {postsListComponent}
      </div>
    </div>
  );
};

export default memo(PostsView);
