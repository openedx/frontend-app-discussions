import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import SearchInfo from '../../components/SearchInfo';
import { selectCurrentCategoryGrouping, selectTopicsUnderCategory } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import {
  selectAllThreads,
  selectTopicThreads,
} from './data/selectors';
import { setSearchQuery } from './data/slices';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import PostsList from './PostsList';

function AllPostsList() {
  const posts = useSelector(selectAllThreads);
  return <PostsList posts={posts} topics={null} />;
}

function TopicPostsList({ topicId }) {
  const posts = useSelector(selectTopicThreads([topicId]));
  return <PostsList posts={posts} topics={[topicId]} />;
}

TopicPostsList.propTypes = {
  topicId: PropTypes.string.isRequired,
};

function CategoryPostsList({ category }) {
  const { inContext } = useContext(DiscussionContext);
  const groupedCategory = useSelector(selectCurrentCategoryGrouping)(category);
  // If grouping at subsection is enabled, only apply it when browsing discussions in context in the learning MFE.
  const topicIds = useSelector(selectTopicsUnderCategory)(inContext ? groupedCategory : category);
  const posts = useSelector(selectTopicThreads(topicIds));
  return <PostsList posts={posts} topics={topicIds} />;
}

CategoryPostsList.propTypes = {
  category: PropTypes.string.isRequired,
};

function PostsView() {
  const {
    topicId,
    category,
  } = useContext(DiscussionContext);
  const dispatch = useDispatch();
  const searchString = useSelector(({ threads }) => threads.filters.search);
  const resultsFound = useSelector(({ threads }) => threads.totalThreads);
  const textSearchRewrite = useSelector(({ threads }) => threads.textSearchRewrite);
  const loadingStatus = useSelector(({ threads }) => threads.status);

  let postsListComponent;

  if (topicId) {
    postsListComponent = <TopicPostsList topicId={topicId} />;
  } else if (category) {
    postsListComponent = <CategoryPostsList category={category} />;
  } else {
    postsListComponent = <AllPostsList />;
  }

  const handleKeyDown = (event) => {
    const { key } = event;
    if (key !== 'ArrowDown' && key !== 'ArrowUp') { return; }
    const option = event.target;

    let selectedOption;
    if (key === 'ArrowDown') { selectedOption = option.nextElementSibling; }
    if (key === 'ArrowUp') { selectedOption = option.previousElementSibling; }

    if (selectedOption) {
      selectedOption.focus();
    }
  };

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
}

PostsView.propTypes = {
};

export default PostsView;
