import { configureStore } from '@reduxjs/toolkit';
import { commentsReducer } from './discussions/comments/data';
import { threadsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';

const store = configureStore({
  reducer: {
    topics: topicsReducer,
    threads: threadsReducer,
    comments: commentsReducer,
  },
});

export default store;
