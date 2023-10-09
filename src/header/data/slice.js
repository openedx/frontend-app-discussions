/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
    name: 'header',
    initialState: {
        isShowChatGPT : false,
        isShowGlobalChatGPT : false
    },
    reducers: {
        showChatGPT : (state) =>{
            state.isShowChatGPT = !state.isShowChatGPT
        },
        showGlobalChatGPT : (state)=>{
            state.isShowGlobalChatGPT = !state.isShowGlobalChatGPT
        },
        closeChatGPT : (state)=>{
            state.isShowGlobalChatGPT = false
        }
        
    },
  });
  

export const {
    showChatGPT, showGlobalChatGPT, closeChatGPT
} = slice.actions

export const {
    reducer,
  } = slice;
  