/* eslint-disable import/prefer-default-export */
export const selectTopicComments = topicId => state => state.comments.comments[topicId] || [];

export const courseTopicsStatus = state => state.comments.status;
