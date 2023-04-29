import React, { useRef } from 'react';

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
import { LegacyBreadcrumbMenu, NavigationBar } from '../navigation';
import { selectPostEditorVisible } from '../posts/data/selectors';
import DiscussionsProductTour from '../tours/DiscussionsProductTour';
import BlackoutInformationBanner from './BlackoutInformationBanner';
import DiscussionContent from './DiscussionContent';
import DiscussionSidebar from './DiscussionSidebar';
import useFeedbackWrapper from './FeedbackWrapper';
import InformationBanner from './InformationBanner';

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
  const isFeedbackBannerVisible = getConfig().DISPLAY_FEEDBACK_BANNER === 'true';
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
              'pl-4 pr-3 py-0': enableInContextSidebar,
            })}
          >
            {!enableInContextSidebar && <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />}
            <PostActionsBar />
          </div>
          {isFeedbackBannerVisible && <InformationBanner />}
          <BlackoutInformationBanner />
        </div>
        {provider === DiscussionProvider.LEGACY && (
          <Route
            path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
            component={LegacyBreadcrumbMenu}
          />
        )}

        <div className="d-flex flex-row">
          <DiscussionSidebar displaySidebar={displaySidebar} postActionBarRef={postActionBarRef} />
          {displayContentArea && <DiscussionContent />}
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
        {!enableInContextSidebar && <DiscussionsProductTour />}
      </main>
      {!enableInContextSidebar && <Footer />}
    </DiscussionContext.Provider>
  );
};

export default React.memo(DiscussionsHome);
