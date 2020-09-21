/* eslint-disable import/prefer-default-export */

export const selectTopicThreads = topicId => state => (state.threads.topicThreadMap[topicId] || []).map(
  threadId => state.threads.threads[threadId],
);

export const selectThread = threadId => state => (state.threads.threads?.[threadId]);

export const selectAllThreads = () => state => Object.values(state.threads.threads);

export const threadsLoadingStatus = () => state => state.threads.status;

export const selectUserThreads = author => state => (
  Object.values(state.threads.threads)
    .filter(thread => thread.author === author)
);

export const selectThreadSorting = () => state => state.threads.sortedBy;

export const selectThreadFilters = () => state => state.threads.filters;
