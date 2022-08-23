import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';
import {
  Route, Switch, useLocation, useRouteMatch,
} from 'react-router';

import Footer from '@edx/frontend-component-footer';
import Header from '@edx/frontend-component-header';

import { PostActionsBar } from '../../components';
import { CourseTabsNavigation } from '../../components/NavigationBar';
import { ALL_ROUTES, DiscussionProvider, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useCourseDiscussionData, useIsOnDesktop, useRedirectToThread, useSidebarVisible,
} from '../data/hooks';
import { selectDiscussionProvider } from '../data/selectors';
import { EmptyLearners, EmptyPosts, EmptyTopics } from '../empty-posts';
import messages from '../messages';
import { BreadcrumbMenu, LegacyBreadcrumbMenu, NavigationBar } from '../navigation';
import { postMessageToParent } from '../utils';
import DiscussionContent from './DiscussionContent';
import DiscussionSidebar from './DiscussionSidebar';

export default function DiscussionsHome() {
  const location = useLocation();
  const postEditorVisible = useSelector(
    (state) => state.threads.postEditorVisible,
  );
  const {
    params: { page },
  } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);

  const { params: { path } } = useRouteMatch(`${Routes.DISCUSSIONS.PATH}/:path*`);
  const { params } = useRouteMatch(ALL_ROUTES);
  const {
    courseId,
    postId,
    topicId,
    category,
    learnerUsername,
  } = params;
  const inContext = new URLSearchParams(location.search).get('inContext') !== null;
  const inIframe = new URLSearchParams(location.search).get('inIframe') !== null;

  // Display the content area if we are currently viewing/editing a post or creating one.
  const displayContentArea = postId || postEditorVisible || (learnerUsername && postId);
  let displaySidebar = useSidebarVisible();

  const isOnDesktop = useIsOnDesktop();

  if (displayContentArea) {
    // If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
    // However, for smaller screens or embeds, only show the sidebar if the content area isn't displayed.
    displaySidebar = isOnDesktop;
  }

  const provider = useSelector(selectDiscussionProvider);
  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId);
  useEffect(() => {
    if (path && path !== 'undefined') {
      postMessageToParent('discussions.navigate', { path });
    }
  }, [path]);

  return (
    <DiscussionContext.Provider value={{
      page,
      courseId,
      postId,
      topicId,
      inContext,
      category,
      learnerUsername,
    }}
    >
      {!inIframe && <Header />}
      <main className="container-fluid d-flex flex-column p-0 h-100 w-100 overflow-hidden" id="main" tabIndex="-1">
        {!inIframe
          && <CourseTabsNavigation activeTab="discussion" courseId={courseId} />}
        <div
          className="d-flex flex-row justify-content-between navbar fixed-top"
          style={{ boxShadow: '0px 2px 4px rgb(0 0 0 / 15%), 0px 2px 8px rgb(0 0 0 / 15%)' }}
        >
          {!inContext && (
            <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />
          )}
          <PostActionsBar inContext={inContext} />
        </div>
        <Route
          path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
          component={provider === DiscussionProvider.LEGACY ? LegacyBreadcrumbMenu : BreadcrumbMenu}
        />
        <div className="d-flex flex-row overflow-hidden flex-grow-1 h-100">
          <DiscussionSidebar displaySidebar={displaySidebar} />
          {displayContentArea && <DiscussionContent />}
          {!displayContentArea && (
          <Switch>
            <Route path={Routes.TOPICS.PATH} component={EmptyTopics} />
            <Route
              path={Routes.POSTS.MY_POSTS}
              render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyMyPosts} />}
            />
            <Route
              path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.LEARNERS.POSTS]}
              render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyAllPosts} />}
            />
            <Route path={Routes.LEARNERS.PATH} component={EmptyLearners} />
          </Switch>
          )}
        </div>
      </main>
      {!inIframe && <Footer />}
    </DiscussionContext.Provider>
  );
}
