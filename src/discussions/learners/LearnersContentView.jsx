import React, { useContext } from 'react';

import { useSelector } from 'react-redux';
import {
  generatePath, Redirect, Route, Switch,
} from 'react-router-dom';

import { Spinner } from '@edx/paragon';

import { LearnerTabs, RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import { learnersLoadingStatus } from './data/selectors';
import CommentsTabContent from './learner/CommentsTabContent';
import PostsTabContent from './learner/PostsTabContent';

function LearnersContentView() {
  const { courseId, learnerUsername } = useContext(DiscussionContext);
  const params = { courseId, learnerUsername };
  const apiStatus = useSelector(learnersLoadingStatus());

  return (
    <div className="learner-content d-flex flex-column">
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
};

export default LearnersContentView;
