/* eslint-disable import/prefer-default-export */
export const selectPostComment = postId => state => state.comments.comment[postId] || null;

export const selectPostReplies = postId => state => state.comments.replies[postId] || [];

export const selectReplyInlineReplies = replyId => state => state.comments.inlineReplies[replyId] || [];
