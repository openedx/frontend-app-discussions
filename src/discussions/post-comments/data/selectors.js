import { createSelector } from '@reduxjs/toolkit';

const selectCommentsById = state => state.comments.commentsById;
const mapIdToComment = (ids, comments) => ids.map(id => comments[id]);

export const selectCommentOrResponseById = commentOrResponseId => createSelector(
  selectCommentsById,
  comments => comments[commentOrResponseId],
);

export const selectThreadComments = (threadId) => createSelector(
  [
    state => state.comments.commentsInThreads[threadId] || [],
    selectCommentsById,
  ],
  mapIdToComment,
);

export const selectCommentResponsesIds = commentId => (
  state => state.comments.commentsInComments[commentId] || []
);

export const selectCommentResponses = commentId => createSelector(
  [
    state => state.comments.commentsInComments[commentId] || [],
    selectCommentsById,
  ],
  mapIdToComment,
);

export const selectThreadHasMorePages = (threadId) => (
  state => state.comments.pagination[threadId]?.hasMorePages || false
);

export const selectThreadCurrentPage = (threadId) => (
  state => state.comments.pagination[threadId]?.currentPage || null
);

export const selectCommentHasMorePages = commentId => (
  state => state.comments.responsesPagination[commentId]?.hasMorePages || false
);

export const selectCommentCurrentPage = commentId => (
  state => state.comments.responsesPagination[commentId]?.currentPage || null
);

export const selectCommentsStatus = state => state.comments.status;

export const selectCommentSortOrder = state => state.comments.sortOrder;
