import React from 'react';
import PropTypes from 'prop-types';

import { Avatar } from '@openedx/paragon';
import { useSelector } from 'react-redux';

import { selectLearnerAvatar } from '../data/selectors';

const LearnerAvatar = ({ username }) => {
  const learnerAvatar = useSelector(selectLearnerAvatar(username));
  return (
    <div className="mr-3 mt-1">
      <Avatar
        size="sm"
        alt={username}
        src={learnerAvatar}
        style={{
          height: '2rem',
          width: '2rem',
        }}
      />
    </div>
  );
};

LearnerAvatar.propTypes = {
  username: PropTypes.string.isRequired,
};

export default React.memo(LearnerAvatar);
