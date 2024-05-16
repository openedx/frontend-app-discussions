import React, {
  lazy, Suspense, useMemo, useRef,
} from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  matchPath, Route, Routes, useLocation, useMatch,
} from 'react-router-dom';

import { LearningHeader as Header } from '@edx/frontend-component-header';

import { Spinner } from '../../components';
import selectCourseTabs from '../../components/NavigationBar/data/selectors';
import { ALL_ROUTES, DiscussionProvider, Routes as ROUTES } from '../../data/constants';
import DiscussionContext from '../common/context';
import ContentUnavailable from '../content-unavailable/ContentUnavailable';
import {
  useCourseBlockData, useCourseDiscussionData, useIsOnTablet, useRedirectToThread, useSidebarVisible,
} from '../data/hooks';
import { selectDiscussionProvider, selectEnableInContext, selectIsUserLearner } from '../data/selectors';
import { EmptyLearners, EmptyTopics } from '../empty-posts';
import EmptyPosts from '../empty-posts/EmptyPosts';
import { EmptyTopic as InContextEmptyTopics } from '../in-context-topics/components';
import messages from '../messages';
import { selectPostEditorVisible } from '../posts/data/selectors';
import { isCourseStatusValid } from '../utils';
import useFeedbackWrapper from './FeedbackWrapper';

const FooterSlot = lazy(() => import('@openedx/frontend-slot-footer'));
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
  const {
    courseNumber, courseTitle, org, courseStatus, isEnrolled,
  } = useSelector(selectCourseTabs);
  const isUserLearner = useSelector(selectIsUserLearner);
  const pageParams = useMatch(ROUTES.COMMENTS.PAGE)?.params;
  const page = pageParams?.page || null;
  const matchPattern = ALL_ROUTES.find((route) => matchPath({ path: route }, location.pathname));
  const { params } = useMatch(matchPattern);
  const isOnTabletorDesktop = useIsOnTablet();
  let displaySidebar = useSidebarVisible();
  const enableInContextSidebar = Boolean(new URLSearchParams(location.search).get('inContextSidebar') !== null);
  const {
    courseId, postId, topicId, category, learnerUsername,
  } = params;

  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId, enableInContextSidebar);
  useCourseBlockData(courseId);
  useFeedbackWrapper();
  /*  Display the content area if we are currently viewing/editing a post or creating one.
  If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
  However, for smaller screens or embeds, only show the sidebar if the content area isn't displayed. */
  const displayContentArea = (postId || postEditorVisible || (learnerUsername && postId));
  if (displayContentArea) { displaySidebar = isOnTabletorDesktop; }

  const discussionContextValue = useMemo(() => ({
    page,
    courseId,
    postId,
    topicId,
    enableInContextSidebar,
    category,
    learnerUsername,
  }));

  return (
    <Suspense fallback={(<Spinner />)}>
      <DiscussionContext.Provider value={discussionContextValue}>
        {!enableInContextSidebar && (<Header courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle} />)}
        <main className="container-fluid d-flex flex-column p-0 w-100" id="main" tabIndex="-1">
          {!enableInContextSidebar && <CourseTabsNavigation />}
          {(isEnrolled || !isUserLearner) && (
            <div
              className={classNames('header-action-bar bg-white position-sticky', {
                'shadow-none border-light-300 border-bottom': enableInContextSidebar,
              })}
              ref={postActionBarRef}
            >
              <div className={classNames('d-flex flex-row justify-content-between navbar fixed-top', {
                'pl-4 pr-2 py-0': enableInContextSidebar,
              })}
              >
                {!enableInContextSidebar && (<NavigationBar />)}
                <PostActionsBar />
              </div>
              <DiscussionsRestrictionBanner />
            </div>
          )}
          {provider === DiscussionProvider.LEGACY && (
            <Suspense fallback={(<Spinner />)}>
              <Routes>
                {[
                  ROUTES.TOPICS.CATEGORY,
                  ROUTES.TOPICS.CATEGORY_POST,
                  ROUTES.TOPICS.CATEGORY_POST_EDIT,
                  ROUTES.TOPICS.TOPIC,
                  ROUTES.TOPICS.TOPIC_POST,
                  ROUTES.TOPICS.TOPIC_POST_EDIT,
                ].map((route) => (
                  <Route
                    key={route}
                    path={route}
                    element={<LegacyBreadcrumbMenu />}
                  />
                ))}
              </Routes>
            </Suspense>
          )}
          {isCourseStatusValid(courseStatus) && (
            !isEnrolled && isUserLearner ? (
              <Suspense fallback={(<Spinner />)}>
                <Routes>
                  {ALL_ROUTES.map((route) => (
                    <Route
                      key={route}
                      path={route}
                      element={(<ContentUnavailable subTitleMessage={messages.contentUnavailableSubTitle} />)}
                    />
                  ))}
                </Routes>
              </Suspense>
            ) : (
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
                  <Routes>
                    <>
                      {ROUTES.TOPICS.PATH.map(route => (
                        <Route
                          key={route}
                          path={`${route}/*`}
                          element={(enableInContext || enableInContextSidebar)
                            ? <InContextEmptyTopics /> : <EmptyTopics />}
                        />
                      ))}
                      <Route
                        path={ROUTES.POSTS.MY_POSTS}
                        element={<EmptyPosts subTitleMessage={messages.emptyMyPosts} />}
                      />
                      {[`${ROUTES.POSTS.PATH}/*`, ROUTES.POSTS.ALL_POSTS, ROUTES.LEARNERS.POSTS].map((route) => (
                        <Route
                          key={route}
                          path={route}
                          element={<EmptyPosts subTitleMessage={messages.emptyAllPosts} />}
                        />
                      ))}
                      <Route path={ROUTES.LEARNERS.PATH} element={<EmptyLearners />} />
                    </>
                  </Routes>
                )}
              </div>
            )
          )}
          {!enableInContextSidebar && isEnrolled && (<DiscussionsProductTour />)}
        </main>
        {!enableInContextSidebar && <FooterSlot />}
      </DiscussionContext.Provider>
    </Suspense>
  );
};

export default React.memo(DiscussionsHome);
