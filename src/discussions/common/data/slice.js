/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';


const reportSlice = createSlice({
  name: 'report',
  initialState: {
    type : '',
    details: ''
  },
  reducers: {
    setType: (state, action) => {
      
        state.type = action.payload;
      },

    setDetails: (state, action) => {
        state.details = action.payload;
      },
    resetReport : (state)=>{
        state.type ='',
        state.details = ''
    }
  },
});

export const {
 setType, setDetails ,resetReport
} = reportSlice.actions;

export const reportReducer = reportSlice.reducer;
