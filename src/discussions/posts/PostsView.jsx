import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import SearchInfo from '../../components/SearchInfo';
import { selectCurrentCategoryGrouping, selectTopicsUnderCategory } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import { selectEnableInContext } from '../data/selectors';
import { selectTopics as selectInContextTopics } from '../in-context-topics/data/selectors';
import { fetchCourseTopicsV3 } from '../in-context-topics/data/thunks';
import { selectTopics } from '../topics/data/selectors';
import { fetchCourseTopics } from '../topics/data/thunks';
import { handleKeyDown } from '../utils';
import { selectAllThreads, selectTopicThreads } from './data/selectors';
import { setSearchQuery } from './data/slices';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import PostsList from './PostsList';

const AllPostsList = () => {
  const posts = useSelector(selectAllThreads);
  return <PostsList posts={posts} topics={null} />;
};

const TopicPostsList = ({ topicId }) => {
  const posts = useSelector(selectTopicThreads([topicId]));
  return <PostsList posts={posts} topics={[topicId]} isTopicTab />;
};

TopicPostsList.propTypes = {
  topicId: PropTypes.string.isRequired,
};

const CategoryPostsList = ({ category }) => {
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const groupedCategory = useSelector(selectCurrentCategoryGrouping)(category);
  // If grouping at subsection is enabled, only apply it when browsing discussions in context in the learning MFE.
  const topicIds = useSelector(selectTopicsUnderCategory)(enableInContextSidebar ? groupedCategory : category);
  const posts = useSelector(enableInContextSidebar ? selectAllThreads : selectTopicThreads(topicIds));
  return <PostsList posts={posts} topics={topicIds} />;
};

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

  let postsListComponent;

  if (topicId) {
    postsListComponent = <TopicPostsList topicId={topicId} />;
  } else if (category) {
    postsListComponent = <CategoryPostsList category={category} />;
  } else {
    postsListComponent = <AllPostsList />;
  }

  return (
    <div className="discussion-posts d-flex flex-column h-100">
      {searchString && (
        <SearchInfo
          count={resultsFound}
          text={searchString}
          loadingStatus={loadingStatus}
          onClear={() => dispatch(setSearchQuery(''))}
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

PostsView.propTypes = {
};

export default PostsView;
