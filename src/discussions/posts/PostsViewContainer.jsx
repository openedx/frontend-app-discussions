import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { AppContext } from '@edx/frontend-platform/react';
import { selectCoursePosts, selectCoursePost, selectUserCoursePosts } from './data/selectors';
import { fetchCoursePosts } from './data/thunks';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import PostsView from './PostsView';

function PostsViewContainer() {
  const {
    courseId,
    embed,
    view,
    postFilter,
    topicId,
    postId,
  } = useParams();
  const dispatch = useDispatch();

  const { authenticatedUser } = useContext(AppContext);

  const currentPost = useSelector(selectCoursePost(postId));

  let posts = [];
  if (topicId || (currentPost && currentPost.topic_id)) {
    posts = useSelector(selectCoursePosts(topicId ?? currentPost.topic_id));
  } else if (postFilter === 'mine') {
    posts = useSelector(selectUserCoursePosts(authenticatedUser.username));
  } else {
    posts = useSelector(selectCoursePosts());
  }
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCoursePosts(courseId));
  }, [courseId]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="discussion-posts d-flex flex-column card">
      { (view === 'discussion' || !embed) && (
        <PostFilterBar />
      )}
      <PostsView posts={posts} />
    </div>
  );
}

export default PostsViewContainer;
