/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

const selectThreads = state => state.threads.threadsById;

const mapIdsToThreads = (ids, threads) => ids.map(id => threads?.[id]);

export const selectTopicThreads = topicId => createSelector(
  [
    state => state.threads.threadsInTopic[topicId] || [],
    selectThreads,
  ],
  mapIdsToThreads,
);

export const selectThread = threadId => createSelector(
  [selectThreads],
  (threads) => threads?.[threadId],
);

export const selectAllThreadsOnPage = (page) => createSelector(
  [
    state => state.threads.pages[page] || [],
    selectThreads,
  ],
  mapIdsToThreads,
);

export const selectAllThreads = () => state => {
  let threads = [];
  let page = 1;
  while (state.threads.pages[page]?.length) {
    threads = threads.concat(selectAllThreadsOnPage(page)(state));
    page += 1;
  }
  return threads;
};

export const threadsLoadingStatus = () => state => state.threads.status;

export const selectUserThreads = author => createSelector(
  [selectThreads],
  (threads) => Object.values(threads)
    .filter(thread => thread.author === author),
);

export const selectThreadSorting = () => state => state.threads.sortedBy;

export const selectThreadFilters = () => state => state.threads.filters;

export const selectAuthorAvatars = author => state => (
  state.threads.avatars?.[author].profile.image
);
