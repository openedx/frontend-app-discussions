/* eslint-disable import/prefer-default-export */
export const selectThreadComments = threadId => state => state.comments.comments[threadId] || [];

export const commentsStatus = state => state.comments.status;
