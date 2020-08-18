import PropTypes from 'prop-types';
import React from 'react';
import Post from './post/Post';


function PostsView({ posts }) {
  return (
    <div className="discussion-posts d-flex flex-column">
      { posts.map(post => <Post post={post} key={post.id} />) }
    </div>
  );
}

PostsView.propTypes = {
  posts: PropTypes.array.isRequired,
};

export default PostsView;
