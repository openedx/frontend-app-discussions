import React, { useContext } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  generatePath, NavLink, Redirect, Route, Switch,
} from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Avatar, ButtonGroup, Card, Icon, IconButton, Spinner,
} from '@edx/paragon';
import { MoreHoriz, Report } from '@edx/paragon/icons';

import { LearnerTabs, RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  learnersLoadingStatus, selectLearner, selectLearnerAvatar, selectLearnerProfile,
} from './data/selectors';
import CommentsTabContent from './learner/CommentsTabContent';
import PostsTabContent from './learner/PostsTabContent';
import messages from './messages';

function LearnersContentView({ intl }) {
  const { courseId, learnerUsername } = useContext(DiscussionContext);
  const params = { courseId, learnerUsername };
  const apiStatus = useSelector(learnersLoadingStatus());
  const learner = useSelector(selectLearner(learnerUsername));
  const profile = useSelector(selectLearnerProfile(learnerUsername));
  const avatar = useSelector(selectLearnerAvatar(learnerUsername));

  const activeTabClass = (active) => classNames('btn', { 'btn-primary': active, 'btn-outline-primary': !active });

  return (
    <div className="learner-content d-flex flex-column">
      <Card>
        <Card.Body>
          <div className="d-flex flex-row align-items-center m-3">
            <Avatar src={avatar} alt={learnerUsername} />
            <span className="font-weight-bold mx-3">
              {profile.username}
            </span>
            <div className="ml-auto">
              <IconButton iconAs={Icon} src={MoreHoriz} alt="Options" />
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="pb-0 bg-light-200 justify-content-center">
          <ButtonGroup className="my-2">
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
        </Card.Footer>
      </Card>

      <Switch>
        <Route path={Routes.LEARNERS.LEARNER} exact>
          <Redirect to={generatePath(Routes.LEARNERS.TABS.posts, params)} />
        </Route>
        <Route
          path={Routes.LEARNERS.TABS.posts}
          component={PostsTabContent}
        />
        <Route path={Routes.LEARNERS.TABS.responses}>
          <CommentsTabContent tab={LearnerTabs.RESPONSES} />
        </Route>
        <Route path={Routes.LEARNERS.TABS.comments}>
          <CommentsTabContent tab={LearnerTabs.COMMENTS} />
        </Route>
      </Switch>

      {
        apiStatus === RequestStatus.IN_PROGRESS && (
          <div className="my-3 text-center">
            <Spinner animation="border" className="mie-3" />
          </div>
        )
      }
    </div>
  );
}

LearnersContentView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LearnersContentView);
