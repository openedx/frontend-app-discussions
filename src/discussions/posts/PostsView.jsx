import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { AppContext } from '@edx/frontend-platform/react';
import { Spinner } from '@edx/paragon';

import ScrollThreshold from '../../components/ScrollThreshold';
import { RequestStatus } from '../../data/constants';
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
import { PostLink } from './post';

function PostsView({ showOwnPosts }) {
  const {
    courseId,
    topicId,
  } = useParams();
  const dispatch = useDispatch();

  const { authenticatedUser } = useContext(AppContext);
  const orderBy = useSelector(selectThreadSorting());
  const filters = useSelector(selectThreadFilters());
  const nextPage = useSelector(selectThreadNextPage());
  const loadingStatus = useSelector(threadsLoadingStatus());

  let posts = [];
  if (topicId) {
    posts = useSelector(selectTopicThreads(topicId));
  } else {
    posts = useSelector(selectAllThreads);
  }
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchThreads(courseId, {
      topicIds: topicId ? [topicId] : null,
      orderBy,
      filters,
      author: showOwnPosts ? authenticatedUser.username : null,
    }));
  }, [courseId, orderBy, filters, showOwnPosts, topicId]);

  const loadMorePosts = async () => {
    if (nextPage) {
      dispatch(fetchThreads(courseId, {
        topicIds: topicId ? [topicId] : null,
        orderBy,
        filters,
        page: nextPage,
        author: showOwnPosts ? authenticatedUser.username : null,
      }));
    }
  };
  let lastPinnedIdx = null;

  return (
    <div className="discussion-posts d-flex flex-column">
      <PostFilterBar filterSelfPosts={showOwnPosts} />
      <div className="list-group list-group-flush">
        {posts && posts.map((post, idx) => {
          if (post.pinned && lastPinnedIdx !== false) {
            lastPinnedIdx = idx;
          } else if (lastPinnedIdx != null && lastPinnedIdx !== false) {
            lastPinnedIdx = false;
            // Add a spacing after the group of pinned posts
            return (
              <>
                <div className="p-1 bg-light-300" />
                <PostLink post={post} key={post.id} />
              </>
            );
          }
          return (<PostLink post={post} key={post.id} />);
        })}
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
