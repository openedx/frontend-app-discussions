import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { DiscussionContext } from '../../common/context';
import { Post } from '../../posts';
import { selectUserPosts } from '../data/selectors';
import { fetchUserPosts } from '../data/thunks';

function PostsTabContent() {
  const dispatch = useDispatch();
  const { courseId, learnerUsername: username } = useContext(DiscussionContext);
  const posts = useSelector(selectUserPosts(username));

  useEffect(() => {
    dispatch(fetchUserPosts(courseId, username));
  }, [courseId, username]);

  return (
    <div className="d-flex flex-column my-3 mx-3 bg-white rounded">
      {posts.map((post) => (
        <div
          data-testid="post"
          key={post.id}
          className="px-3 pb-3 border-bottom border-light-500"
        >
          <Post post={post} />
        </div>
      ))}
    </div>
  );
}

PostsTabContent.propTypes = {};

export default PostsTabContent;
