import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { AppContext } from '@edx/frontend-platform/react';
import { Spinner } from '@edx/paragon';

import ScrollThreshold from '../../components/ScrollThreshold';
import { RequestStatus } from '../../data/constants';
import { selectTopicsUnderCategory } from '../../data/selectors';
import { DiscussionContext } from '../common/context';
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

function PostsList({ posts }) {
  let lastPinnedIdx = null;
  const postInstances = posts && posts.map((post, idx) => {
    if (post.pinned && lastPinnedIdx !== false) {
      lastPinnedIdx = idx;
    } else if (lastPinnedIdx != null && lastPinnedIdx !== false) {
      lastPinnedIdx = false;
      // Add a spacing after the group of pinned posts
      return (
        <React.Fragment key={post.id}>
          <div className="p-1 bg-light-300" />
          <PostLink post={post} key={post.id} />
        </React.Fragment>
      );
    }
    return (<PostLink post={post} key={post.id} />);
  });
  return (
    <>
      {postInstances}
      {posts && posts.length === 0 && <NoResults />}
    </>
  );
}

PostsList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    pinned: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
  })),
};

PostsList.defaultProps = {
  posts: [],
};

function PostsView({ showOwnPosts }) {
  const {
    courseId,
    topicId,
    category,
  } = useContext(DiscussionContext);
  const dispatch = useDispatch();
  const { authenticatedUser } = useContext(AppContext);
  let topicIds = null;
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const nextPage = useSelector(selectThreadNextPage());
  const loadingStatus = useSelector(threadsLoadingStatus());

  let postsListComponent = null;
  let posts = [];
  if (topicId) {
    posts = useSelector(selectTopicThreads([topicId]));
  } else if (category) {
    topicIds = useSelector(selectTopicsUnderCategory)(category);
    posts = useSelector(selectTopicThreads(topicIds));
  } else {
    posts = useSelector(selectAllThreads);
  }
  postsListComponent = <PostsList posts={posts} />;
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchThreads(courseId, {
      topicIds,
      orderBy,
      filters,
      author: showOwnPosts ? authenticatedUser.username : null,
    }));
  }, [courseId, orderBy, filters, showOwnPosts, topicId, category]);

  const loadMorePosts = async () => {
    if (nextPage) {
      dispatch(fetchThreads(courseId, {
        topicIds,
        orderBy,
        filters,
        page: nextPage,
        author: showOwnPosts ? authenticatedUser.username : null,
      }));
    }
  };

  return (
    <div className="discussion-posts d-flex flex-column">
      <PostFilterBar filterSelfPosts={showOwnPosts} />
      <div className="list-group list-group-flush">
        {postsListComponent}
        {loadingStatus === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          nextPage && (
            <ScrollThreshold onScroll={loadMorePosts} />
          )
        )}
      </div>
    </div>
  );
}

PostsView.propTypes = {
  showOwnPosts: PropTypes.bool,
};

PostsView.defaultProps = {
  showOwnPosts: false,
};

export default PostsView;
