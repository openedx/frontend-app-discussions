/* eslint-disable import/prefer-default-export */
export const selectThreadComments = threadId => state => (state.comments.threadCommentMap[threadId] || []).map(
  commentId => state.comments.comments[commentId],
);

export const commentsStatus = state => state.comments.status;
