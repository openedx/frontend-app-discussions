import { configureStore } from '@reduxjs/toolkit';

import { commentsReducer } from './discussions/comments/data';
import { threadsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';

export function initializeStore(preloadedState = undefined) {
  return configureStore({
    reducer: {
      topics: topicsReducer,
      threads: threadsReducer,
      comments: commentsReducer,
    },
    preloadedState,
  });
}

const store = initializeStore();

export default store;
