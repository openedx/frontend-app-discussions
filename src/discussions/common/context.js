/* eslint-disable import/prefer-default-export */
import React from 'react';

export const DiscussionContext = React.createContext({
  courseId: null,
  postId: null,
  category: null,
  commentId: null,
});
