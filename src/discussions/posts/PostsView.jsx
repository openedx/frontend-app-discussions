import PropTypes from 'prop-types';
import React from 'react';
import PostFilterBar from './post-filter-bar/PostFilterBar';
import Post, { postShape } from './post/Post';

function PostsView({ posts, filterSelfPosts }) {
  return (
    <div className="discussion-posts d-flex flex-column card">
      <PostFilterBar filterSelfPosts={filterSelfPosts} />
      <div className="list-group list-group-flush">
        { posts.map(post => <Post post={post} key={post.id} />) }
      </div>
    </div>
  );
}

PostsView.propTypes = {
  filterSelfPosts: PropTypes.bool,
  posts: PropTypes.arrayOf(postShape).isRequired,
};

PostsView.defaultProps = {
  filterSelfPosts: false,
};

export default PostsView;
