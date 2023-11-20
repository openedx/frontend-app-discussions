import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router';

import Spinner from '../../components/Spinner';
import { RequestStatus, Routes } from '../../data/constants';
import { useEnableInContextSidebar, useShowLearnersTab } from '../data/hooks';
import { selectConfigLoadingStatus, selectEnableInContext } from '../data/selectors';
import ResizableSidebar from './ResizableSidebar';

const TopicPostsView = lazy(() => import('../in-context-topics/TopicPostsView'));
const InContextTopicsView = lazy(() => import('../in-context-topics/TopicsView'));
const LearnerPostsView = lazy(() => import('../learners/LearnerPostsView'));
const LearnersView = lazy(() => import('../learners/LearnersView'));
const PostsView = lazy(() => import('../posts/PostsView'));
const LegacyTopicsView = lazy(() => import('../topics/TopicsView'));

const DiscussionSidebar = ({ postActionBarRef }) => {
  const location = useLocation();
  const enableInContextSidebar = useEnableInContextSidebar();
  const enableInContext = useSelector(selectEnableInContext);
  const configStatus = useSelector(selectConfigLoadingStatus);
  const redirectToLearnersTab = useShowLearnersTab();

  const memoizedRedirection = React.useMemo(() => (
    <Suspense fallback={(<Spinner />)}>
      <Switch>
        {enableInContext && !enableInContextSidebar && (
          <Route
            path={Routes.TOPICS.ALL}
            component={InContextTopicsView}
            exact
          />
        )}
        {enableInContext && !enableInContextSidebar && (
          <Route
            path={[
              Routes.TOPICS.TOPIC,
              Routes.TOPICS.CATEGORY,
              Routes.TOPICS.TOPIC_POST,
              Routes.TOPICS.TOPIC_POST_EDIT,
            ]}
            component={TopicPostsView}
            exact
          />
        )}
        <Route
          path={[Routes.POSTS.ALL_POSTS, Routes.POSTS.MY_POSTS, Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
          component={PostsView}
        />
        <Route path={Routes.TOPICS.PATH} component={LegacyTopicsView} />
        {redirectToLearnersTab && (
          <Route path={Routes.LEARNERS.POSTS} component={LearnerPostsView} />
        )}
        {redirectToLearnersTab && (
          <Route path={Routes.LEARNERS.PATH} component={LearnersView} />
        )}
        {configStatus === RequestStatus.SUCCESSFUL && (
          <Redirect
            from={Routes.DISCUSSIONS.PATH}
            to={{
              ...location,
              pathname: Routes.POSTS.ALL_POSTS,
            }}
          />
        )}
      </Switch>
    </Suspense>
  ), [enableInContext, enableInContextSidebar, configStatus, location, redirectToLearnersTab]);

  return (
    <ResizableSidebar postActionBarRef={postActionBarRef}>
      {memoizedRedirection}
    </ResizableSidebar>
  );
};

DiscussionSidebar.propTypes = {
  postActionBarRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

export default React.memo(DiscussionSidebar);
