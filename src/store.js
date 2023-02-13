import { configureStore } from '@reduxjs/toolkit';

import { courseTabsReducer } from './components/NavigationBar/data';
import { blocksReducer } from './data/slices';
import { cohortsReducer } from './discussions/cohorts/data';
import { configReducer } from './discussions/data/slices';
import { inContextTopicsReducer } from './discussions/in-context-topics/data';
import { learnersReducer } from './discussions/learners/data';
import { commentsReducer } from './discussions/post-comments/data';
import { threadsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';
import { toursReducer } from './discussions/tours/data';

export function initializeStore(preloadedState = undefined) {
  return configureStore({
    reducer: {
      topics: topicsReducer,
      threads: threadsReducer,
      comments: commentsReducer,
      cohorts: cohortsReducer,
      config: configReducer,
      inContextTopics: inContextTopicsReducer,
      blocks: blocksReducer,
      learners: learnersReducer,
      courseTabs: courseTabsReducer,
      tours: toursReducer,
    },
    preloadedState,
  });
}

const store = initializeStore();

export default store;
