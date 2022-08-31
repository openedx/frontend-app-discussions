import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { injectIntl } from '@edx/frontend-platform/i18n';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { discussionsPath } from '../../utils';
import LearnerAvatar from './LearnerAvatar';
import LearnerFooter from './LearnerFooter';
import { learnerShape } from './proptypes';

function LearnerCard({
  learner,
  courseId,
}) {
  const { inContext, learnerUsername } = useContext(DiscussionContext);
  const linkUrl = discussionsPath(Routes.LEARNERS.POSTS, {
    0: inContext ? 'in-context' : undefined,
    learnerUsername: learner.username,
    courseId,
  });

  return (
    <Link
      className="discussion-post p-0 text-decoration-none text-gray-900 border-bottom border-light-400"
      to={linkUrl}
    >
      <div
        className="d-flex flex-row flex-fill mw-100 py-3 px-4 border-primary-500"
        style={learner.username === learnerUsername ? {
          borderRightWidth: '4px',
          borderRightStyle: 'solid',
        } : null}
      >
        <LearnerAvatar learner={learner} />
        <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
          <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
            <div className="d-flex align-items-center flex-fill">
              <div
                className="text-truncate font-weight-500 font-size-14 text-primary-500 font-style-normal font-family-inter"
              >
                {learner.username}
              </div>
            </div>
            {learner.threads === null ? null : <LearnerFooter learner={learner} /> }
          </div>
        </div>
      </div>
    </Link>
  );
}

LearnerCard.propTypes = {
  learner: learnerShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(LearnerCard);
