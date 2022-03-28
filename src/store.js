import { configureStore } from '@reduxjs/toolkit';

import { blocksReducer } from './data/slices';
import { cohortsReducer } from './discussions/cohorts/data';
import { commentsReducer } from './discussions/comments/data';
import { configReducer } from './discussions/data/slices';
import { learnersReducer } from './discussions/learners/data';
import { threadsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';

export function initializeStore(preloadedState = undefined) {
  return configureStore({
    reducer: {
      topics: topicsReducer,
      threads: threadsReducer,
      comments: commentsReducer,
      cohorts: cohortsReducer,
      config: configReducer,
      blocks: blocksReducer,
      learners: learnersReducer,
    },
    preloadedState,
  });
}

const store = initializeStore();

export default store;
