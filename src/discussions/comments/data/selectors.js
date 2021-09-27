/* eslint-disable import/prefer-default-export */
import { createSelector } from '@reduxjs/toolkit';

const selectCommentsById = state => state.comments.commentsById;
const mapIdToComment = (ids, comments) => ids.map(id => comments[id]);

export const selectThreadComments = threadId => createSelector(
  [
    state => state.comments.commentsInThreads[threadId] || [],
    selectCommentsById,
  ],
  mapIdToComment,
);

export const selectCommentResponses = commentId => createSelector(
  [
    state => state.comments.commentsInComments[commentId] || [],
    selectCommentsById,
  ],
  mapIdToComment,
);

export const selectThreadHasMorePages = threadId => (
  store => store.comments.pagination[threadId]?.hasMorePages || false
);

export const selectThreadCurrentPage = threadId => (
  store => store.comments.pagination[threadId]?.currentPage || null
);

export const commentsStatus = state => state.comments.status;
