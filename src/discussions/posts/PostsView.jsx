import PropTypes from 'prop-types';
import React from 'react';
import Post, { postShape } from './post/Post';

function PostsView({ posts }) {
  return (
    <div className="discussion-posts d-flex flex-column">
      { posts.map(post => <Post post={post} key={post.id} />) }
    </div>
  );
}

PostsView.propTypes = {
  posts: PropTypes.arrayOf(postShape).isRequired,
};

export default PostsView;
