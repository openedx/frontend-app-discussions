/* eslint-disable import/prefer-default-export */
export const selectCoursePosts = topicId => state => {
  if (topicId) {
    return state.posts.topicPostMap[topicId] || [];
  }

  return Object.values(state.posts.posts);
};

export const selectUserCoursePosts = author => state => (
  Object.values(state.posts.posts).filter(post => post.author === author)
);
