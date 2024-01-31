import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import SearchInfo from '../../components/SearchInfo';
import { selectCurrentCategoryGrouping, selectTopicsUnderCategory } from '../../data/selectors';
import DiscussionContext from '../common/context';
import { selectEnableInContext } from '../data/selectors';
import { selectTopics as selectInContextTopics } from '../in-context-topics/data/selectors';
import fetchCourseTopicsV3 from '../in-context-topics/data/thunks';
import { selectTopics } from '../topics/data/selectors';
import fetchCourseTopics from '../topics/data/thunks';
import { handleKeyDown } from '../utils';
import { selectAllThreadsIds, selectTopicThreadsIds } from './data/selectors';
import { setSearchQuery } from './data/slices';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import PostsList from './PostsList';

const AllPostsList = () => {
  const postsIds = useSelector(selectAllThreadsIds);

  return <PostsList postsIds={postsIds} topicsIds={null} />;
};

const TopicPostsList = React.memo(({ topicId }) => {
  const postsIds = useSelector(selectTopicThreadsIds([topicId]));

  return <PostsList postsIds={postsIds} topicsIds={[topicId]} isTopicTab />;
});

TopicPostsList.propTypes = {
  topicId: PropTypes.string.isRequired,
};

const CategoryPostsList = React.memo(({ category }) => {
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const groupedCategory = useSelector(selectCurrentCategoryGrouping)(category);
  // If grouping at subsection is enabled, only apply it when browsing discussions in context in the learning MFE.
  const topicIds = useSelector(selectTopicsUnderCategory)(enableInContextSidebar ? groupedCategory : category);
  const postsIds = useSelector(enableInContextSidebar ? selectAllThreadsIds : selectTopicThreadsIds(topicIds));

  return <PostsList postsIds={postsIds} topicsIds={topicIds} />;
});

CategoryPostsList.propTypes = {
  category: PropTypes.string.isRequired,
};

const PostsView = () => {
  const {
    topicId,
    category,
    courseId,
    enableInContextSidebar,
  } = useContext(DiscussionContext);
  const dispatch = useDispatch();
  const enableInContext = useSelector(selectEnableInContext);
  const searchString = useSelector(({ threads }) => threads.filters.search);
  const resultsFound = useSelector(({ threads }) => threads.totalThreads);
  const textSearchRewrite = useSelector(({ threads }) => threads.textSearchRewrite);
  const loadingStatus = useSelector(({ threads }) => threads.status);
  const topics = useSelector(enableInContext ? selectInContextTopics : selectTopics);

  useEffect(() => {
    if (isEmpty(topics)) {
      dispatch((enableInContext || enableInContextSidebar)
        ? fetchCourseTopicsV3(courseId)
        : fetchCourseTopics(courseId));
    }
  }, [topics]);

  const handleOnClear = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, []);

  const postsListComponent = useMemo(() => {
    if (topicId) {
      return <TopicPostsList topicId={topicId} />;
    }
    if (category) {
      return <CategoryPostsList category={category} />;
    }
    return <AllPostsList />;
  }, [topicId, category]);

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      {searchString && (
        <SearchInfo
          count={resultsFound}
          text={searchString}
          loadingStatus={loadingStatus}
          onClear={handleOnClear}
          textSearchRewrite={textSearchRewrite}
        />
      )}
      <PostFilterBar />
      <div className="border-bottom border-light-400" />
      <div className="list-group list-group-flush flex-fill" role="list" onKeyDown={e => handleKeyDown(e)}>
        {postsListComponent}
      </div>
    </div>
  );
};

export default PostsView;
