/* eslint-disable import/prefer-default-export */
import React from 'react';

export const PostCommentsContext = React.createContext({
  isClosed: false,
  postType: 'discussion',
  postId: '',
});
