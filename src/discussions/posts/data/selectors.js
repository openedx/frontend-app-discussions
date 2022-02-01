/* eslint-disable import/prefer-default-export */

import { createSelector } from '@reduxjs/toolkit';

const selectThreads = state => state.threads.threadsById;

const mapIdsToThreads = (ids, threads) => ids.map(id => threads?.[id]);

export const selectTopicThreads = topicIds => createSelector(
  [
    state => (topicIds || []).flatMap(topicId => state.threads.threadsInTopic[topicId] || []),
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

export const selectAllThreads = createSelector(
  [
    state => state.threads.pages,
    selectThreads,
  ],
  (pages, threads) => pages.flatMap(ids => mapIdsToThreads(ids, threads)),
);

export const threadsLoadingStatus = () => state => state.threads.status;

export const selectThreadSorting = () => state => state.threads.sortedBy;

export const selectThreadFilters = () => state => state.threads.filters;

export const selectThreadNextPage = () => state => state.threads.nextPage;

export const selectAuthorAvatars = author => state => (
  state.threads.avatars?.[author]?.profile.image
);
