/* eslint-disable import/prefer-default-export */
export const selectThreads = topicId => state => (state.threads.topicThreadMap[topicId] || []).map(
  threadId => state.threads.threads[threadId],
);

export const threadsStatus = state => state.threads.status;
