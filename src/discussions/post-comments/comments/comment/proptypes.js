/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const commentShape = PropTypes.shape({
  createdAt: PropTypes.string,
  abuseFlagged: PropTypes.bool,
  renderedBody: PropTypes.string,
  endorsedBy: PropTypes.string,
  endorsedAt: PropTypes.string,
  endorsed: PropTypes.bool,
  author: PropTypes.string,
  authorLabel: PropTypes.string,
  users: PropTypes.objectOf(PropTypes.shape({
    profile: PropTypes.shape({
      hasImage: PropTypes.bool,
      imageUrlFull: PropTypes.string,
      imageUrlLarge: PropTypes.string,
      imageUrlMedium: PropTypes.string,
      imageUrlSmall: PropTypes.string,
    }),
  })),
});
