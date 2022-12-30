/* eslint-disable import/prefer-default-export */
import React from 'react';

export const DiscussionContext = React.createContext({
  page: null,
  courseId: null,
  postId: null,
  topicId: null,
  enableInContextSidebar: false,
  category: null,
  learnerUsername: null,
});
