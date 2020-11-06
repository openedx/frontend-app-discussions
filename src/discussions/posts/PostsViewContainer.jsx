import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { selectThreads } from './data/selectors';
import { fetchThreads } from './data/thunks';
import PostsView from './PostsView';

function PostsViewContainer() {
  const { courseId, topicId } = useParams();
  const dispatch = useDispatch();
  const posts = useSelector(selectThreads(topicId));
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchThreads(courseId));
  }, [courseId]);

  return (
    <PostsView posts={posts} />
  );
}

PostsViewContainer.propTypes = {};

export default PostsViewContainer;
