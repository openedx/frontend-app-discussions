import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { selectCurrentCategoryGrouping, selectTopicsUnderCategory } from '../../data/selectors';
import { useCategory, useEnableInContextSidebar } from '../data/hooks';
import { selectAllThreadsIds, selectTopicThreadsIds } from './data/selectors';
import PostsList from './PostsList';

const PostsView = () => {
  const category = useCategory();
  const enableInContextSidebar = useEnableInContextSidebar();

  const groupedCategory = useSelector(selectCurrentCategoryGrouping)(category);
  // If grouping at subsection is enabled, only apply it when browsing discussions in context in the learning MFE.
  const topicIds = useSelector(selectTopicsUnderCategory)(enableInContextSidebar ? groupedCategory : category);
  const postsIds = useSelector(enableInContextSidebar ? selectAllThreadsIds : selectTopicThreadsIds(topicIds));

  return <PostsList postsIds={postsIds} topicsIds={topicIds} />;
};

export default memo(PostsView);
