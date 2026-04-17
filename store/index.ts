import { configureStore } from '@reduxjs/toolkit';
import peopleReducer from './slices/peopleSlice';
import giftsReducer from './slices/giftsSlice';
import occasionsReducer from './slices/occasionsSlice';
import settingsReducer from './slices/settingsSlice';
import adsReducer from './slices/adsSlice';

export const store = configureStore({
  reducer: {
    people: peopleReducer,
    gifts: giftsReducer,
    occasions: occasionsReducer,
    settings: settingsReducer,
    ads: adsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
