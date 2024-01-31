import React from 'react';

const PostCommentsContext = React.createContext({
  isClosed: false,
  postType: 'discussion',
  postId: '',
});

export default PostCommentsContext;
