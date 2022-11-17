import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router';

import { useWindowSize } from '@edx/paragon';

import { RequestStatus, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useContainerSize, useIsOnDesktop, useIsOnXLDesktop, useShowLearnersTab,
} from '../data/hooks';
import { selectconfigLoadingStatus } from '../data/selectors';
import { LearnerPostsView, LearnersView } from '../learners';
import { PostsView } from '../posts';
import { TopicsView } from '../topics';

export default function DiscussionSidebar({ displaySidebar, postActionBarRef }) {
  const location = useLocation();
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();
  const configStatus = useSelector(selectconfigLoadingStatus);
  const redirectToLearnersTab = useShowLearnersTab();
  const sidebarRef = useRef(null);
  const postActionBarHeight = useContainerSize(postActionBarRef);
  const { height: windowHeight } = useWindowSize();
  const { inContext } = useContext(DiscussionContext);

  useEffect(() => {
    if (sidebarRef && postActionBarHeight && !inContext) {
      if (isOnDesktop) {
        sidebarRef.current.style.maxHeight = `${windowHeight - postActionBarHeight}px`;
      }
      sidebarRef.current.style.minHeight = `${windowHeight - postActionBarHeight}px`;
      sidebarRef.current.style.top = `${postActionBarHeight}px`;
    }
  }, [sidebarRef, postActionBarHeight, inContext]);

  return (
    <div
      ref={sidebarRef}
      className={classNames('flex-column  position-sticky', {
        'd-none': !displaySidebar,
        'd-flex overflow-auto': displaySidebar,
        'w-100': !isOnDesktop,
        'sidebar-desktop-width': isOnDesktop && !isOnXLDesktop,
        'w-25 sidebar-XL-width': isOnXLDesktop,
        'min-content-height': !inContext,
      })}
      data-testid="sidebar"
    >
      <Switch>
        <Route
          path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.TOPICS.CATEGORY, Routes.POSTS.MY_POSTS]}
          component={PostsView}
        />
        <Route path={Routes.TOPICS.PATH} component={TopicsView} />
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
    </div>
  );
}

DiscussionSidebar.defaultProps = {
  displaySidebar: false,
  postActionBarRef: null,
};

DiscussionSidebar.propTypes = {
  displaySidebar: PropTypes.bool,
  postActionBarRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};
