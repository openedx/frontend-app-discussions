import { selectCommentOrResponseById } from '../post-comments/data/selectors';
import { selectThread } from '../posts/data/selectors';

export const contentSelector = {
  POST: selectThread,
  COMMENT: selectCommentOrResponseById,
};

export const contentType = {
  POST: 'POST',
  COMMENT: 'COMMENT',
};
