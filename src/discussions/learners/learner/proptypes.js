/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const learnerShape = PropTypes.shape({
  activeFlags: PropTypes.number,
  inactiveFlags: PropTypes.number,
  username: PropTypes.string,
  userFirstName: PropTypes.string,
  replies: PropTypes.number,
  responses: PropTypes.number,
  threads: PropTypes.number,
});
