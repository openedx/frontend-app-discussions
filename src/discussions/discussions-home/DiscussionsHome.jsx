import React from 'react';

import { useSelector } from 'react-redux';
import {
  Route, Switch, useLocation, useRouteMatch,
} from 'react-router';

import { PostActionsBar } from '../../components';
import { ALL_ROUTES, DiscussionProvider, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useCourseTopicsAndBlocks,
  useIsOnDesktop,
  useRedirectToThread,
  useSidebarVisible,
} from '../data/hooks';
import { selectDiscussionProvider } from '../data/selectors';
import { EmptyPosts, EmptyTopics } from '../empty-posts';
import messages from '../messages';
import { BreadcrumbMenu, LegacyBreadcrumbMenu, NavigationBar } from '../navigation';
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
  const { params } = useRouteMatch(ALL_ROUTES);
  const {
    courseId,
    postId,
    topicId,
    category,
  } = params;
  const inContext = new URLSearchParams(location.search).get('inContext') !== null;

  // Display the content area if we are currently viewing/editing a post or creating one.
  const displayContentArea = postId || postEditorVisible;

  const isSidebarVisible = useSidebarVisible();
  let displaySidebar = isSidebarVisible;

  const isOnDesktop = useIsOnDesktop();

  if (displayContentArea) {
    // If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
    // However, for smaller screens or embeds, only show the sidebar if the content area isn't displayed.
    displaySidebar = isOnDesktop;
  }

  const provider = useSelector(selectDiscussionProvider);
  useCourseTopicsAndBlocks(courseId);
  useRedirectToThread(courseId);

  return (
    <DiscussionContext.Provider value={{
      page,
      courseId,
      postId,
      topicId,
      inContext,
      category,
    }}
    >
      <main className="container-fluid d-flex flex-column p-0 h-100 w-100 overflow-hidden">
        <div className="d-flex flex-row justify-content-between shadow navbar fixed-top">
          {!inContext && (
          <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />
          )}
          <PostActionsBar inContext={inContext} />
        </div>
        <Route
          path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
          component={provider === DiscussionProvider.LEGACY ? LegacyBreadcrumbMenu : BreadcrumbMenu}
        />
        <div className="d-flex flex-row overflow-hidden">
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
              path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS]}
              render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyAllPosts} />}
            />
          </Switch>
          )}
        </div>
      </main>
    </DiscussionContext.Provider>
  );
}
