// src/store.ts
import { configureStore, createSlice } from '@reduxjs/toolkit';

const webcamSlice = createSlice({
  name: 'webcam',
  initialState: { isWebcamOn: false },
  reducers: {
    setWebcamOn(state, action) {
      state.isWebcamOn = action.payload;
    }
  }
});

export const { setWebcamOn } = webcamSlice.actions;

const store = configureStore({
  reducer: {
    webcam: webcamSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
