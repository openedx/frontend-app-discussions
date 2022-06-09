import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { AppContext } from '@edx/frontend-platform/react';
import { Spinner } from '@edx/paragon';

import ScrollThreshold from '../../components/ScrollThreshold';
import { RequestStatus } from '../../data/constants';
import { selectTopicsUnderCategory } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
import { selectUserIsPrivileged, selectUserIsStaff } from '../data/selectors';
import {
  selectAllThreads,
  selectThreadFilters,
  selectThreadNextPage,
  selectThreadSorting,
  selectTopicThreads,
  threadsLoadingStatus,
} from './data/selectors';
import { fetchThreads } from './data/thunks';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import NoResults from './NoResults';
import { PostLink } from './post';

function PostsList({ posts, topics }) {
  const dispatch = useDispatch();
  const {
    courseId,
    page,
  } = useContext(DiscussionContext);
  const loadingStatus = useSelector(threadsLoadingStatus());
  const { authenticatedUser } = useContext(AppContext);
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const nextPage = useSelector(selectThreadNextPage());
  const showOwnPosts = page === 'my-posts';
  const userIsPrivileged = useSelector(selectUserIsPrivileged);
  const userIsStaff = useSelector(selectUserIsStaff);
  const loadThreads = (topicIds, pageNum = undefined) => dispatch(fetchThreads(courseId, {
    topicIds,
    orderBy,
    filters,
    page: pageNum,
    author: showOwnPosts ? authenticatedUser.username : null,
    countFlagged: userIsPrivileged || userIsStaff,
  }));

  useEffect(() => {
    if (topics !== undefined) {
      loadThreads(topics);
    }
  }, [courseId, orderBy, filters, page, JSON.stringify(topics)]);

  const checkIsSelected = (id) => window.location.pathname.includes(id);

  let lastPinnedIdx = null;
  const postInstances = posts && posts.map((post, idx) => {
    if (post.pinned && lastPinnedIdx !== false) {
      lastPinnedIdx = idx;
    } else if (lastPinnedIdx != null && lastPinnedIdx !== false) {
      lastPinnedIdx = false;
      // Add a spacing after the group of pinned posts
      return (
        <React.Fragment key={post.id}>
          <div className="p-1 bg-light-400" />
          <PostLink post={post} key={post.id} isSelected={checkIsSelected} />
        </React.Fragment>
      );
    }
    return (<PostLink post={post} key={post.id} isSelected={checkIsSelected} />);
  });
  return (
    <>
      {postInstances}
      {posts && posts.length === 0 && <NoResults />}
      {loadingStatus === RequestStatus.IN_PROGRESS ? (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      ) : (
        nextPage && (
          <ScrollThreshold onScroll={() => {
            loadThreads(topics, nextPage);
          }}
          />
        )
      )}
    </>
  );
}

PostsList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    pinned: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
  })),
  topics: PropTypes.arrayOf(PropTypes.string),
};

PostsList.defaultProps = {
  posts: [],
  topics: undefined,
};

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
      <div className="list-group list-group-flush">
        {postsListComponent}
      </div>
    </div>
  );
}

PostsView.propTypes = {
};

export default PostsView;
