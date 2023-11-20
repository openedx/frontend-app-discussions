import React, { memo, useEffect } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import { useCourseId, useEnableInContextSidebar, useTopicId } from '../data/hooks';
import { selectEnableInContext } from '../data/selectors';
import { selectTopics as selectInContextTopics } from '../in-context-topics/data/selectors';
import { fetchCourseTopicsV3 } from '../in-context-topics/data/thunks';
import { selectTopics } from '../topics/data/selectors';
import { fetchCourseTopics } from '../topics/data/thunks';
import { selectTopicThreadsIds } from './data/selectors';
import PostsList from './PostsList';

const TopicPostsList = () => {
  const dispatch = useDispatch();
  const topicId = useTopicId();
  const courseId = useCourseId();
  const enableInContextSidebar = useEnableInContextSidebar();
  const enableInContext = useSelector(selectEnableInContext);
  const postsIds = useSelector(selectTopicThreadsIds([topicId]));
  const topics = useSelector(enableInContext ? selectInContextTopics : selectTopics);

  useEffect(() => {
    if (isEmpty(topics)) {
      dispatch((enableInContext || enableInContextSidebar)
        ? fetchCourseTopicsV3(courseId)
        : fetchCourseTopics(courseId));
    }
  }, [courseId, topics]);

  return <PostsList postsIds={postsIds} topicsIds={[topicId]} isTopicTab />;
};

export default memo(TopicPostsList);
