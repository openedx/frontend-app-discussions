import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { discussionsPath } from '../../utils';
import { selectLearnerLastLogin } from '../data/selectors';
import messages from '../messages';
import LearnerAvatar from './LearnerAvatar';
import LearnerFooter from './LearnerFooter';
import { learnerShape } from './proptypes';

function LearnerCard({
  learner,
  intl,
  courseId,
}) {
  const { inContext, learnerUsername } = useContext(DiscussionContext);
  const learnerLastLogin = useSelector(selectLearnerLastLogin(learner.username));
  const lastActiveTime = timeago.format(new Date(learnerLastLogin), intl.locale);
  const linkUrl = discussionsPath(Routes.LEARNERS.POSTS, {
    0: inContext ? 'in-context' : undefined,
    learnerUsername: learner.username,
    courseId,
  });

  return (
    <Link
      className="list-group-item list-group-item-action p-0 text-decoration-none text-gray-900 mw-100"
      to={linkUrl}
    >
      <div
        className="d-flex flex-row flex-fill mw-100 p-3.5 border-primary-500"
        style={learner.username === learnerUsername ? {
          borderRightWidth: '4px',
          borderRightStyle: 'solid',
        } : null}
      >
        <LearnerAvatar learner={learner} />
        <div className="d-flex flex-column" style={{ width: 'calc(100% - 4rem)' }}>
          <div className="align-items-center d-flex flex-row flex-fill mb-3">
            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
              <div className="h4 d-flex align-items-center pb-0 mb-0 flex-fill">
                <div className="flex-fill text-truncate">
                  {learner.username}
                </div>
              </div>
              {learnerLastLogin
                && <span> {intl.formatMessage(messages.lastActive, { lastActiveTime })}</span>}
            </div>
          </div>
          <LearnerFooter learner={learner} />
        </div>
      </div>
    </Link>
  );
}

LearnerCard.propTypes = {
  learner: learnerShape.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(LearnerCard);
