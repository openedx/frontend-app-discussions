import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { selectTopicsUnderCategory } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import {
  selectAllThreads,
  selectTopicThreads,
} from './data/selectors';
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
  const topicIds = useSelector(selectTopicsUnderCategory)(category);
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
    page,
  } = useContext(DiscussionContext);

  let postsListComponent;
  const showOwnPosts = page === 'my-posts';

  if (topicId) {
    postsListComponent = <TopicPostsList topicId={topicId} />;
  } else if (category) {
    postsListComponent = <CategoryPostsList category={category} />;
  } else {
    postsListComponent = <AllPostsList />;
  }

  return (
    <div className="discussion-posts d-flex flex-column">
      <PostFilterBar filterSelfPosts={showOwnPosts} />
      <div className="list-group list-group-flush" role="list">
        {postsListComponent}
      </div>
    </div>
  );
}

PostsView.propTypes = {
};

export default PostsView;
