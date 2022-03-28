import React from 'react';

import { useSelector } from 'react-redux';

import { Avatar } from '@edx/paragon';

import { selectLearnerAvatar } from '../data/selectors';
import { learnerShape } from './proptypes';

function LearnerAvatar({ learner }) {
  const learnerAvatar = useSelector(selectLearnerAvatar(learner.username));
  return (
    <div className="mr-2">
      <Avatar
        size="md"
        className="mt-2.5 ml-2.5"
        alt={learner.username}
        src={learnerAvatar}
      />
    </div>
  );
}

LearnerAvatar.propTypes = {
  learner: learnerShape.isRequired,
};

export default LearnerAvatar;
