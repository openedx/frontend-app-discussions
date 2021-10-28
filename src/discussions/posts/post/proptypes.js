/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const postShape = PropTypes.shape({
  abuseFlagged: PropTypes.bool,
  author: PropTypes.string,
  commentCount: PropTypes.number,
  courseId: PropTypes.string,
  following: PropTypes.bool,
  id: PropTypes.string,
  pinned: PropTypes.bool,
  rawBody: PropTypes.string,
  hasEndorsed: PropTypes.bool,
  previewBody: PropTypes.string,
  read: PropTypes.bool,
  title: PropTypes.string,
  topicId: PropTypes.string,
  type: PropTypes.string,
  updatedAt: PropTypes.string,
});
