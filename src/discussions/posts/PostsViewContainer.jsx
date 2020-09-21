import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { AppContext } from '@edx/frontend-platform/react';
import { selectCoursePosts, selectUserCoursePosts } from './data/selectors';
import { fetchCoursePosts } from './data/thunks';
import PostsView from './PostsView';

function PostsViewContainer({ mine }) {
  const { courseId, topicId } = useParams();
  const dispatch = useDispatch();

  const { authenticatedUser } = useContext(AppContext);

  let posts = [];
  if (topicId) {
    posts = useSelector(selectCoursePosts(topicId));
  } else if (mine) {
    posts = useSelector(selectUserCoursePosts(authenticatedUser.username));
  } else {
    posts = useSelector(selectCoursePosts());
  }
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCoursePosts(courseId));
  }, [courseId]);

  return (
    <PostsView posts={posts} filterSelfPosts={mine} />
  );
}

PostsViewContainer.propTypes = {
  mine: PropTypes.bool,
};

PostsViewContainer.defaultProps = {
  mine: false,
};

export default PostsViewContainer;
