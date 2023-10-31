/* eslint-disable no-param-reassign,import/prefer-default-export */
import { createSlice } from '@reduxjs/toolkit';


const reportSlice = createSlice({
  name: 'report',
  initialState: {
    type : '',
    details: '' ,
    reports : []
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
    },
    addReports : (state, action) => {
      state.reports.push(action.payload)
    }
  },
});

export const {
 setType, setDetails ,resetReport , addReports
} = reportSlice.actions;

export const reportReducer = reportSlice.reducer;
