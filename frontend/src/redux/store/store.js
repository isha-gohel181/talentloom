import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../slice/user.slice';
import postReducer from '../slice/post.slice';
import replyReducer from '../slice/reply.slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    reply: replyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});