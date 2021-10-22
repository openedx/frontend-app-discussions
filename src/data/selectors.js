/* eslint-disable import/prefer-default-export */

export const selectTopicContext = (topicId) => (state) => state.blocks.topics[topicId];

export const selectBlocks = (state) => state.blocks.blocks;
export const selectChapters = (state) => state.blocks.chapters;

export const selectCurrentSelection = (state) => ({
  currentChapter: state.blocks.currentChapter,
  currentSequential: state.blocks.currentSequential,
  currentVertical: state.blocks.currentVertical,
});

export const selectTopicIds = () => (state) => state.blocks.chapters;
