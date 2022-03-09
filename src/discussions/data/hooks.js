/* eslint-disable import/prefer-default-export */
import { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { AppContext } from '@edx/frontend-platform/react';
import { breakpoints, useWindowSize } from '@edx/paragon';

import { Routes } from '../../data/constants';
import { fetchCourseBlocks } from '../../data/thunks';
import { clearRedirect } from '../posts/data';
import { fetchThreads } from '../posts/data/thunks';
import { selectTopics } from '../topics/data/selectors';
import { fetchCourseTopics } from '../topics/data/thunks';
import { discussionsPath } from '../utils';
import { selectAreThreadsFiltered, selectPostThreadCount } from './selectors';
import { fetchCourseConfig } from './thunks';

export function useTotalTopicThreadCount() {
  const topics = useSelector(selectTopics);

  if (!topics) {
    return 0;
  }

  return Object.keys(topics).reduce((total, topicId) => {
    const topic = topics[topicId];
    return total + topic.threadCounts.discussion + topic.threadCounts.question;
  }, 0);
}

export const useSidebarVisible = () => {
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);
  const isViewingTopics = useRouteMatch(Routes.TOPICS.PATH);

  if (isFiltered) {
    return true;
  }

  if (isViewingTopics) {
    return true;
  }

  return totalThreads > 0;
};

export function useCourseDiscussionData(courseId) {
  const dispatch = useDispatch();
  const { authenticatedUser } = useContext(AppContext);

  useEffect(() => {
    async function fetchBaseData() {
      await dispatch(fetchCourseConfig(courseId));
      await dispatch(fetchCourseTopics(courseId));
      await dispatch(fetchCourseBlocks(courseId, authenticatedUser.username));
      await dispatch(fetchThreads(courseId, { author: authenticatedUser.username }));
    }

    fetchBaseData();
  }, [courseId]);
}

export function useRedirectToThread(courseId) {
  const dispatch = useDispatch();
  const redirectToThread = useSelector(
    (state) => state.threads.redirectToThread,
  );
  const history = useHistory();
  const location = useLocation();

  return useEffect(() => {
    // After posting a new thread we'd like to redirect users to it, the topic and post id are temporarily
    // stored in redirectToThread
    if (redirectToThread) {
      dispatch(clearRedirect());
      const newLocation = discussionsPath(Routes.COMMENTS.PAGES['my-posts'], {
        courseId,
        postId: redirectToThread.threadId,
      })(location);
      history.push(newLocation);
    }
  }, [redirectToThread]);
}

export function useIsOnDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.large.minWidth;
}
