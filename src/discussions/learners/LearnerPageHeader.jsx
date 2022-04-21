import React, { useContext } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { generatePath, NavLink } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, ButtonGroup, Icon } from '@edx/paragon';
import { Report } from '@edx/paragon/icons';

import { Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { selectLearner, selectLearnerAvatar, selectLearnerProfile } from './data/selectors';
import messages from './messages';

function LearnerPageHeader({ intl }) {
  const { courseId, learnerUsername } = useContext(DiscussionContext);
  const params = { courseId, learnerUsername };
  const learner = useSelector(selectLearner(learnerUsername));
  const profile = useSelector(selectLearnerProfile(learnerUsername));
  const avatar = useSelector(selectLearnerAvatar(learnerUsername));

  const activeTabClass = (active) => classNames('btn', { 'btn-primary': active, 'btn-outline-primary': !active });

  return (
    <div className="d-flex flex-column w-100 bg-white shadow-sm">
      <div className="d-flex flex-row align-items-center m-4">
        <Avatar src={avatar} alt={learnerUsername} />
        <span className="font-weight-bold mx-3">
          {profile.username}
        </span>
      </div>
      <div className="d-flex pb-0 bg-light-200 justify-content-center p-2 flex-fill">
        <ButtonGroup className="my-2 bg-white">
          <NavLink
            className={activeTabClass}
            to={generatePath(Routes.LEARNERS.TABS.posts, params)}
          >
            {intl.formatMessage(messages.postsTab)} <span className="ml-3">{learner.threads}</span>
            {
              learner.activeFlags ? (
                <span className="ml-3">
                  <Icon src={Report} />
                </span>
              ) : null
            }
          </NavLink>
          <NavLink
            className={activeTabClass}
            to={generatePath(Routes.LEARNERS.TABS.responses, params)}
          >
            {intl.formatMessage(messages.responsesTab)} <span className="ml-3">{learner.responses}</span>
          </NavLink>
          <NavLink
            className={activeTabClass}
            to={generatePath(Routes.LEARNERS.TABS.comments, params)}
          >
            {intl.formatMessage(messages.commentsTab)} <span className="ml-3">{learner.replies}</span>
          </NavLink>
        </ButtonGroup>
      </div>
    </div>
  );
}

LearnerPageHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LearnerPageHeader);
