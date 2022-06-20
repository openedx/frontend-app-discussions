import React from 'react';

import { useSelector } from 'react-redux';

import { Avatar } from '@edx/paragon';

import { selectLearnerAvatar } from '../data/selectors';
import { learnerShape } from './proptypes';

function LearnerAvatar({ learner }) {
  const learnerAvatar = useSelector(selectLearnerAvatar(learner.username));
  return (
    <div className="mr-3 mt-1">
      <Avatar
        size="sm"
        alt={learner.username}
        src={learnerAvatar}
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
