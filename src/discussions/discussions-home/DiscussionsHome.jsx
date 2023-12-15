import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Route, Switch, useLocation, useRouteMatch, matchPath
} from 'react-router';

// import Footer from '@edx/frontend-component-footer';
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
import HeaderLearning from '../../header/HeaderLearning';
import Courses from '../courses/Courses';
import EmptyCourses from '../empty-posts/EmptyCourses';
import Footer from '../../footer/Footer';



export default function DiscussionsHome() {
  const location = useLocation();
  const postActionBarRef = useRef(null);
  const postEditorVisible = useSelector(
    (state) => state.threads.postEditorVisible,
  );
  const {
    params: { page },
  } = useRouteMatch(`${Routes.COMMENTS.PAGE}?`);

  const { params: { path } } = useRouteMatch(`${Routes.DISCUSSIONS.PATH}/:path*`);
  const { params } = useRouteMatch(ALL_ROUTES);
  const isRedirectToLearners = useShowLearnersTab();
  const isFeedbackBannerVisible = getConfig().DISPLAY_FEEDBACK_BANNER === 'true';

  const {
    courseId,
    postId,
    topicId,
    category,
    learnerUsername,
  } = params;
  const inContext = new URLSearchParams(location.search).get('inContext') !== null;
  // Display the content area if we are currently viewing/editing a post or creating one.
  const displayContentArea = postId || postEditorVisible || (learnerUsername && postId);
  let displaySidebar = useSidebarVisible();

  const isOnDesktop = useIsOnDesktop();

  const { courseNumber, courseTitle, org } = useSelector((state) => state.courseTabs);
  if (displayContentArea) {
    // If the window is larger than a particular size, show the sidebar for navigating between posts/topics.
    // However, for smaller screens or embeds, only show the sidebar if the content area isn't displayed.
    displaySidebar = isOnDesktop;
  }

  const provider = useSelector(selectDiscussionProvider);
  useCourseDiscussionData(courseId);
  useRedirectToThread(courseId, inContext);
  useEffect(() => {
    if (path && path !== 'undefined') {
      postMessageToParent('discussions.navigate', { path });
    }
  }, [path]);

  const [show , setShow] = useState(false)
  const [styling, setStyling] = useState('css-yeymkw')
  const isShowChatGPT = useSelector(state =>state.header.isShowGlobalChatGPT)
  
  useEffect(() => {
    setStyling(show ? (isShowChatGPT ? 'css-14u8e49' : 'css-jygthk') : (isShowChatGPT ? 'css-1mjee9h' : 'css-yeymkw'));
  }, [show, isShowChatGPT]);


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
      {/* {!inContext && <Header courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle} />} */}
      {!inContext && <HeaderLearning  courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle}/>}
      <main className="container-fluid d-flex flex-column p-0 w-100" id="main" tabIndex="-1">
        <div className={styling}>

        {!inContext && <CourseTabsNavigation activeTab="discussion" courseId={courseId} />}
        <div
          className={classNames('header-action-bar', { 'shadow-none border-light-300 border-bottom': inContext })}
          ref={postActionBarRef}
        >
          <div
            className={classNames('d-flex flex-row justify-content-between navbar ', {
              'pl-4 pr-2.5 py-1.5': inContext,
            })}
          >
            {!inContext && <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />}
            <PostActionsBar inContext={inContext} />
          </div>
          {isFeedbackBannerVisible && <InformationBanner />}
          <BlackoutInformationBanner />
        </div>
        {!inContext && (
          <Route
            path={[Routes.POSTS.PATH, Routes.TOPICS.CATEGORY]}
            component={provider === DiscussionProvider.LEGACY ? LegacyBreadcrumbMenu : BreadcrumbMenu}
          />
        )}

        <div className="d-flex flex-row" >
          <DiscussionSidebar displaySidebar={displaySidebar} postActionBarRef={postActionBarRef} />
          {displayContentArea && <DiscussionContent />}
          <Route path={Routes.COURSES.PATH} >
              <div style={{minWidth:'29rem'}}>
                  <Courses />
              </div>
         </Route>
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
              <Route path={Routes.COURSES.PATH} component={EmptyCourses} />
            </Switch>
          )}
        </div>
        </div>
      </main>
      {/* {!inContext && <Footer />} */}
      {!inContext &&  <Footer />}
    </DiscussionContext.Provider>
  );
}
