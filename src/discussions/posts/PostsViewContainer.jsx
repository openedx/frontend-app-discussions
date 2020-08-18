import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { selectCourseThreads } from './data/selectors';
import { fetchCourseThreads } from './data/thunks';
import PostsView from './PostsView';

function PostsViewContainer() {
  const { courseId, discussionId } = useParams();
  const dispatch = useDispatch();
  const posts = useSelector(selectCourseThreads(discussionId));
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCourseThreads(courseId));
  }, [courseId]);

  return (
    <PostsView posts={posts} />
  );
}

PostsViewContainer.propTypes = {};

export default PostsViewContainer;
