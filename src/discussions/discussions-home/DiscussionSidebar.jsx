import React, {
  lazy, Suspense, useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';

import { useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Navigate, Route, Routes,
} from 'react-router-dom';

import Spinner from '../../components/Spinner';
import { RequestStatus, Routes as ROUTES } from '../../data/constants';
import DiscussionContext from '../common/context';
import {
  useContainerSize, useIsOnDesktop, useIsOnTablet, useIsOnXLDesktop,
} from '../data/hooks';
import { selectConfigLoadingStatus, selectEnableInContext } from '../data/selectors';

const TopicPostsView = lazy(() => import('../in-context-topics/TopicPostsView'));
const InContextTopicsView = lazy(() => import('../in-context-topics/TopicsView'));
const LearnerPostsView = lazy(() => import('../learners/LearnerPostsView'));
const LearnersView = lazy(() => import('../learners/LearnersView'));
const PostsView = lazy(() => import('../posts/PostsView'));
const LegacyTopicsView = lazy(() => import('../topics/TopicsView'));

const DiscussionSidebar = ({ displaySidebar, postActionBarRef }) => {
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();
  const isOnTablet = useIsOnTablet();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const enableInContext = useSelector(selectEnableInContext);
  const configStatus = useSelector(selectConfigLoadingStatus);
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
        'sidebar-tablet-width': isOnTablet && !isOnDesktop,
        'w-25 sidebar-XL-width': isOnXLDesktop,
        'min-content-height': !enableInContextSidebar,
      })}
      data-testid="sidebar"
    >
      <Suspense fallback={(<Spinner />)}>
        <Routes>
          {enableInContext && !enableInContextSidebar && (
            <Route
              path={ROUTES.TOPICS.ALL}
              element={<InContextTopicsView />}
            />
          )}
          {enableInContext && !enableInContextSidebar && (
            [
              ROUTES.TOPICS.TOPIC,
              ROUTES.TOPICS.CATEGORY,
              ROUTES.TOPICS.TOPIC_POST,
              ROUTES.TOPICS.TOPIC_POST_EDIT,
            ].map((route) => (
              <Route
                key={route}
                path={route}
                element={<TopicPostsView />}
              />
            ))
          )}
          {[
            ROUTES.POSTS.ALL_POSTS,
            ROUTES.POSTS.EDIT_ALL_POSTS,
            ROUTES.POSTS.MY_POSTS,
            ROUTES.POSTS.EDIT_MY_POSTS,
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
              element={<PostsView />}
            />
          ))}
          {ROUTES.TOPICS.PATH.map(path => (
            <Route key={path} path={path} element={<LegacyTopicsView />} />
          ))}
          {
            [ROUTES.LEARNERS.POSTS, ROUTES.LEARNERS.POSTS_EDIT].map((route) => (
              <Route key={route} path={route} element={<LearnerPostsView />} />
            ))
          }
          <Route path={ROUTES.LEARNERS.PATH} element={<LearnersView />} />
          {configStatus === RequestStatus.SUCCESSFUL && (
            <Route path={`${ROUTES.DISCUSSIONS.PATH}/*`} element={<Navigate to="posts" />} />
          )}
        </Routes>
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
