import React, { useEffect, useRef } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Route, Switch, useLocation, useRouteMatch,
} from 'react-router';

import Footer from '@edx/frontend-component-footer';
import { LearningHeader as Header } from '@edx/frontend-component-header';
import { getConfig } from '@edx/frontend-platform';

import { PostActionsBar } from '../../components';
import { CourseTabsNavigation } from '../../components/NavigationBar';
import { ALL_ROUTES, DiscussionProvider, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useCourseDiscussionData, useIsOnDesktop, useRedirectToThread, useShowLearnersTab, useSidebarVisible,
} from '../data/hooks';
import { selectDiscussionProvider } from '../data/selectors';
import { EmptyLearners, EmptyPosts, EmptyTopics } from '../empty-posts';
import messages from '../messages';
import { BreadcrumbMenu, LegacyBreadcrumbMenu, NavigationBar } from '../navigation';
import { postMessageToParent } from '../utils';
import BlackoutInformationBanner from './BlackoutInformationBanner';
import DiscussionContent from './DiscussionContent';
import DiscussionSidebar from './DiscussionSidebar';
import InformationBanner from './InformationsBanner';

export default function DiscussionsHome() {
  const location = useLocation();
  const postActionBarRef = useRef(null);
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);
  const { courseNumber, courseTitle, org } = useSelector((state) => state.courseTabs);
  const provider = useSelector(selectDiscussionProvider);
  const enableInContext = (provider === DiscussionProvider.OPEN_EDX);
  const { params: { page } } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);
  const { params: { path } } = useRouteMatch(`${Routes.DISCUSSIONS.PATH}/:path*`);
  const { params } = useRouteMatch(ALL_ROUTES);
  const isRedirectToLearners = useShowLearnersTab();
  const isOnDesktop = useIsOnDesktop();
  let displaySidebar = useSidebarVisible();
  const isFeedbackBannerVisible = getConfig().DISPLAY_FEEDBACK_BANNER === 'true';
  const {
    courseId, postId, topicId, category, learnerUsername,
  } = params;
  const enableInContextSidebar = ((new URLSearchParams(location.search).get('inContextSidebar')
    !== null) && enableInContext);
  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId);

  /*  Display the content area if we are currently viewing/editing a post or creating one.
  If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
  However, for smaller screens or embeds, onlyshow the sidebar if the content area isn't displayed. */
  const displayContentArea = (postId || postEditorVisible || (learnerUsername && postId));
  if (displayContentArea) { displaySidebar = isOnDesktop; }

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
      enableInContextSidebar,
      category,
      learnerUsername,
    }}
    >
      {!enableInContextSidebar && <Header courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle} />}
      <main className="container-fluid d-flex flex-column p-0 w-100" id="main" tabIndex="-1">
        {!enableInContextSidebar && <CourseTabsNavigation activeTab="discussion" courseId={courseId} />}
        <div
          className={classNames('header-action-bar', {
            'shadow-none border-light-300 border-bottom': enableInContextSidebar,
          })}
          ref={postActionBarRef}
        >
          <div
            className={classNames('d-flex flex-row justify-content-between navbar fixed-top', {
              'pl-4 pr-2.5 py-1.5': enableInContextSidebar,
            })}
          >
            {!enableInContextSidebar && <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />}
            <PostActionsBar />
          </div>
          {isFeedbackBannerVisible && <InformationBanner />}
          <BlackoutInformationBanner />
        </div>
        {!enableInContextSidebar && (
          <Route
            path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
            component={provider === DiscussionProvider.LEGACY ? LegacyBreadcrumbMenu : BreadcrumbMenu}
          />
        )}
        <div className="d-flex flex-row">
          <DiscussionSidebar displaySidebar={displaySidebar} postActionBarRef={postActionBarRef} />
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
              {isRedirectToLearners && <Route path={Routes.LEARNERS.PATH} component={EmptyLearners} /> }
            </Switch>
          )}
        </div>
      </main>
      {!enableInContextSidebar && <Footer />}
    </DiscussionContext.Provider>
  );
}
