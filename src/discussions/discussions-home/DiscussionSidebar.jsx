import React, {
  lazy, Suspense, useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router';

import { useWindowSize } from '@edx/paragon';

import Spinner from '../../components/Spinner';
import { RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useContainerSize, useIsOnDesktop, useIsOnXLDesktop, useShowLearnersTab,
} from '../data/hooks';
import { selectconfigLoadingStatus, selectEnableInContext } from '../data/selectors';

const TopicPostsView = lazy(() => import('../in-context-topics/TopicPostsView'));
const InContextTopicsView = lazy(() => import('../in-context-topics/TopicsView'));
const LearnerPostsView = lazy(() => import('../learners/LearnerPostsView'));
const LearnersView = lazy(() => import('../learners/LearnersView'));
const PostsView = lazy(() => import('../posts/PostsView'));
const LegacyTopicsView = lazy(() => import('../topics/TopicsView'));

const DiscussionSidebar = ({ displaySidebar, postActionBarRef }) => {
  const location = useLocation();
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const enableInContext = useSelector(selectEnableInContext);
  const configStatus = useSelector(selectconfigLoadingStatus);
  const redirectToLearnersTab = useShowLearnersTab();
  const sidebarRef = useRef(null);
  const postActionBarHeight = useContainerSize(postActionBarRef);
  const { height: windowHeight } = useWindowSize();

  useEffect(() => {
    if (sidebarRef && postActionBarHeight && !enableInContextSidebar) {
      if (isOnDesktop) {
        sidebarRef.current.style.maxHeight = `${windowHeight - postActionBarHeight}px`;
      }
      sidebarRef.current.style.minHeight = `${windowHeight - postActionBarHeight}px`;
      sidebarRef.current.style.top = `${postActionBarHeight}px`;
    }
  }, [sidebarRef, postActionBarHeight, enableInContextSidebar]);

  return (
    <div
      ref={sidebarRef}
      className={classNames('flex-column position-sticky', {
        'd-none': !displaySidebar,
        'd-flex overflow-auto box-shadow-centered-1': displaySidebar,
        'w-100': !isOnDesktop,
        'sidebar-desktop-width': isOnDesktop && !isOnXLDesktop,
        'w-25 sidebar-XL-width': isOnXLDesktop,
        'min-content-height': !enableInContextSidebar,
      })}
      data-testid="sidebar"
    >
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
    </div>
  );
};

DiscussionSidebar.propTypes = {
  displaySidebar: PropTypes.bool,
  postActionBarRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

DiscussionSidebar.defaultProps = {
  displaySidebar: false,
  postActionBarRef: null,
};

export default React.memo(DiscussionSidebar);
