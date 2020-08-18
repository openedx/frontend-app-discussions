import { configureStore } from '@reduxjs/toolkit';
import { commentsReducer } from './discussions/comments/data';
import { courseThreadsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';

const store = configureStore({
  reducer: {
    topics: topicsReducer,
    threads: courseThreadsReducer,
    comments: commentsReducer,
  },
});

export default store;
