/* eslint-disable react/jsx-no-constructed-context-values */
import React, { lazy, Suspense, useRef } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Route, Switch, useLocation, useRouteMatch,
} from 'react-router';

import { LearningHeader as Header } from '@edx/frontend-component-header';

import { Spinner } from '../../components';
import { selectCourseTabs } from '../../components/NavigationBar/data/selectors';
import { ALL_ROUTES, DiscussionProvider, Routes } from '../../data/constants';
import { DiscussionContext } from '../common/context';
import {
  useCourseDiscussionData, useIsOnDesktop, useRedirectToThread, useShowLearnersTab, useSidebarVisible,
} from '../data/hooks';
import { selectDiscussionProvider, selectEnableInContext } from '../data/selectors';
import { EmptyLearners, EmptyPosts, EmptyTopics } from '../empty-posts';
import { EmptyTopic as InContextEmptyTopics } from '../in-context-topics/components';
import messages from '../messages';
import { selectPostEditorVisible } from '../posts/data/selectors';
import useFeedbackWrapper from './FeedbackWrapper';

const Footer = lazy(() => import('@edx/frontend-component-footer'));
const PostActionsBar = lazy(() => import('../posts/post-actions-bar/PostActionsBar'));
const CourseTabsNavigation = lazy(() => import('../../components/NavigationBar/CourseTabsNavigation'));
const LegacyBreadcrumbMenu = lazy(() => import('../navigation/breadcrumb-menu/LegacyBreadcrumbMenu'));
const NavigationBar = lazy(() => import('../navigation/navigation-bar/NavigationBar'));
const DiscussionsProductTour = lazy(() => import('../tours/DiscussionsProductTour'));
const DiscussionsRestrictionBanner = lazy(() => import('./DiscussionsRestrictionBanner'));
const DiscussionContent = lazy(() => import('./DiscussionContent'));
const DiscussionSidebar = lazy(() => import('./DiscussionSidebar'));

const DiscussionsHome = () => {
  const location = useLocation();
  const postActionBarRef = useRef(null);
  const postEditorVisible = useSelector(selectPostEditorVisible);
  const provider = useSelector(selectDiscussionProvider);
  const enableInContext = useSelector(selectEnableInContext);
  const { courseNumber, courseTitle, org } = useSelector(selectCourseTabs);
  const { params: { page } } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);
  const { params } = useRouteMatch(ALL_ROUTES);
  const isRedirectToLearners = useShowLearnersTab();
  const isOnDesktop = useIsOnDesktop();
  let displaySidebar = useSidebarVisible();
  const enableInContextSidebar = Boolean(new URLSearchParams(location.search).get('inContextSidebar') !== null);
  const {
    courseId, postId, topicId, category, learnerUsername,
  } = params;

  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId, enableInContextSidebar);
  useFeedbackWrapper();
  /*  Display the content area if we are currently viewing/editing a post or creating one.
  If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
  However, for smaller screens or embeds, onlyshow the sidebar if the content area isn't displayed. */
  const displayContentArea = (postId || postEditorVisible || (learnerUsername && postId));
  if (displayContentArea) { displaySidebar = isOnDesktop; }

  return (
    <Suspense fallback={(<Spinner />)}>
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
        {!enableInContextSidebar && (
          <Header courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle} />
        )}
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
                'pl-4 pr-3 py-0': enableInContextSidebar,
              })}
            >
              {!enableInContextSidebar && (
                <NavigationBar />
              )}
              <PostActionsBar />
            </div>
            <DiscussionsRestrictionBanner />
          </div>
          {provider === DiscussionProvider.LEGACY && (
          <Suspense fallback={(<Spinner />)}>
            <Route
              path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
              component={LegacyBreadcrumbMenu}
            />
          </Suspense>
          )}
          <div className="d-flex flex-row position-relative">
            <Suspense fallback={(<Spinner />)}>
              <DiscussionSidebar displaySidebar={displaySidebar} postActionBarRef={postActionBarRef} />
            </Suspense>
            {displayContentArea && (
              <Suspense fallback={(<Spinner />)}>
                <DiscussionContent />
              </Suspense>
            )}
            {!displayContentArea && (
            <Switch>
              <Route
                path={Routes.TOPICS.PATH}
                component={(enableInContext || enableInContextSidebar) ? InContextEmptyTopics : EmptyTopics}
              />
              <Route
                path={Routes.POSTS.MY_POSTS}
                render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyMyPosts} />}
              />
              <Route
                path={[Routes.POSTS.PATH, Routes.POSTS.ALL_POSTS, Routes.LEARNERS.POSTS]}
                render={routeProps => <EmptyPosts {...routeProps} subTitleMessage={messages.emptyAllPosts} />}
              />
              {isRedirectToLearners && <Route path={Routes.LEARNERS.PATH} component={EmptyLearners} />}
            </Switch>
            )}
          </div>
          {!enableInContextSidebar && (
            <DiscussionsProductTour />
          )}
        </main>
        {!enableInContextSidebar && <Footer />}
      </DiscussionContext.Provider>
    </Suspense>
  );
};

export default React.memo(DiscussionsHome);
