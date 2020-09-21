import { configureStore } from '@reduxjs/toolkit';
import { commentsReducer } from './discussions/comments/data';
import { coursePostsReducer } from './discussions/posts/data';
import { topicsReducer } from './discussions/topics/data';

const store = configureStore({
  reducer: {
    topics: topicsReducer,
    comments: commentsReducer,
    posts: coursePostsReducer,
  },
});

export default store;
