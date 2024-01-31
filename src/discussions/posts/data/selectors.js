import { createSelector } from '@reduxjs/toolkit';

const selectThreads = state => state.threads.threadsById;

const mapIdsToThreads = (ids, threads) => ids.map(id => threads?.[id]);

export const selectPostEditorVisible = state => state.threads.postEditorVisible;

export const selectTopicThreads = topicIds => createSelector(
  [
    state => (topicIds || []).flatMap(topicId => state.threads.threadsInTopic[topicId] || []),
    selectThreads,
  ],
  mapIdsToThreads,
);

export const selectTopicThreadsIds = topicIds => state => (
  (topicIds || []).flatMap(topicId => state.threads.threadsInTopic[topicId] || [])
);

export const selectThreadsByIds = ids => createSelector(
  [selectThreads],
  (threads) => mapIdsToThreads(ids, threads),
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

export const selectAllThreadsIds = createSelector(
  [state => state.threads.pages],
  pages => pages.flatMap(ids => ids),
);

export const threadsLoadingStatus = () => state => state.threads.status;

export const selectThreadSorting = () => state => state.threads.sortedBy;

export const selectThreadFilters = () => state => state.threads.filters;

export const selectThreadNextPage = () => state => state.threads.nextPage;
