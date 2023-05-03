import React from 'react';

import { Avatar } from '@edx/paragon';

import { learnerShape } from './proptypes';

const LearnerAvatar = ({ learner }) => (
  <div className="mr-3 mt-1">
    <Avatar
      size="sm"
      alt={learner.username}
      style={{
        height: '2rem',
        width: '2rem',
      }}
    />
  </div>
);

LearnerAvatar.propTypes = {
  learner: learnerShape.isRequired,
};

export default LearnerAvatar;
