import React from 'react';

import { Avatar } from '@edx/paragon';

import { learnerShape } from './proptypes';

function LearnerAvatar({ learner }) {
  return (
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
}

LearnerAvatar.propTypes = {
  learner: learnerShape.isRequired,
};

export default LearnerAvatar;
