/* eslint-disable import/prefer-default-export */
import {
  useCallback, useContext, useEffect, useState,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { breakpoints, useWindowSize } from '@edx/paragon';

import { Routes } from '../../data/constants';
import { fetchCourseBlocks } from '../../data/thunks';
import { clearRedirect } from '../posts/data';
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
    }

    fetchBaseData();
  }, [courseId]);
}

export function useUrlUpdate(initialPostId, initialTopicId, test = false) {
  const [postId, setpostId] = useState(initialPostId);
  const [topicId, settopicId] = useState(initialTopicId);
  const [message, setMessage] = useState('');

  const updatePost = useCallback((newPost) => setpostId(newPost));
  useEffect(() => {
    if (window !== window.parent || test) {
      setMessage({
        type: 'discussions.path.change',
        payload: {
          postId,
          topicId,
        },
      });
      window.parent.postMessage({ message }, getConfig().LMS_BASE_URL);
    }
  }, [postId, topicId]);
  return {
    message, updatePost, setpostId, settopicId,
  };
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
