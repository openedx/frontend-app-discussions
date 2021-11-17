/* eslint-disable import/prefer-default-export */

export const selectTopicContext = (topicId) => (state) => state.blocks.topics[topicId];
