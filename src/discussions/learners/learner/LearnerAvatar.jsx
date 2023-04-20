import React from 'react';
import PropTypes from 'prop-types';

import { Avatar } from '@edx/paragon';

const LearnerAvatar = ({ username }) => (
  <div className="mr-3 mt-1">
    <Avatar
      size="sm"
      alt={username}
      style={{
        height: '2rem',
        width: '2rem',
      }}
    />
  </div>
);

LearnerAvatar.propTypes = {
  username: PropTypes.string.isRequired,
};

export default React.memo(LearnerAvatar);
