import PropTypes from 'prop-types';

const learnerShape = PropTypes.shape({
  activeFlags: PropTypes.number,
  inactiveFlags: PropTypes.number,
  username: PropTypes.string,
  replies: PropTypes.number,
  responses: PropTypes.number,
  threads: PropTypes.number,
});

export default learnerShape;
