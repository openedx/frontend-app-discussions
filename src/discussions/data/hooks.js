/* eslint-disable import/prefer-default-export */
import {
  useContext, useEffect, useRef, useState,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { breakpoints, useWindowSize } from '@edx/paragon';

import { Routes } from '../../data/constants';
import { selectTopicsUnderCategory } from '../../data/selectors';
import { fetchCourseBlocks } from '../../data/thunks';
import { DiscussionContext } from '../common/context';
import { clearRedirect } from '../posts/data';
import { selectTopics } from '../topics/data/selectors';
import { fetchCourseTopics } from '../topics/data/thunks';
import { discussionsPath } from '../utils';
import {
  selectAreThreadsFiltered, selectLearnersTabEnabled,
  selectModerationSettings,
  selectPostThreadCount,
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
} from './selectors';
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
  const isViewingLearners = useRouteMatch(Routes.LEARNERS.PATH);

  if (isFiltered) {
    return true;
  }

  if (isViewingTopics || isViewingLearners) {
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

export function useRedirectToThread(courseId, inContext) {
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
      const newLocation = discussionsPath(Routes.COMMENTS.PAGES[inContext ? 'topics' : 'my-posts'], {
        courseId,
        postId: redirectToThread.threadId,
        topicId: redirectToThread.topicId,
      })(location);
      history.push(newLocation);
    }
  }, [redirectToThread]);
}

export function useIsOnDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.large.minWidth;
}

export function useIsOnXLDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.extraLarge.minWidth;
}

/**
 * This hook posts a resize message to the parent window if running in an iframe
 * @param refContainer reference to the component whose size is to be measured
 */
export function useContainerSize(refContainer) {
  const location = useLocation();
  const [height, setHeight] = useState();

  const resizeObserver = useRef(new ResizeObserver(() => {
    /* istanbul ignore if: ResizeObserver isn't available in the testing env */
    if (refContainer?.current) {
      setHeight(refContainer?.current?.clientHeight);
    }
  }));

  useEffect(() => {
    const container = refContainer?.current;
    const observer = resizeObserver?.current;
    if (container && observer) {
      observer.observe(container);
      setHeight(container.clientHeight);
    }

    return () => {
      if (container && observer) {
        observer.unobserve(container);
      }
    };
  }, [refContainer, resizeObserver, location]);

  return height;
}

export const useAlertBannerVisible = (content) => {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === content.author;
  const canSeeLastEditOrClosedAlert = (userHasModerationPrivileges || userIsContentAuthor || userIsGroupTa);
  const canSeeReportedBanner = content.abuseFlagged;

  return (
    (reasonCodesEnabled && canSeeLastEditOrClosedAlert && (content.lastEdit?.reason || content.closed))
    || (content.abuseFlagged && canSeeReportedBanner)
  );
};

export const useShowLearnersTab = () => useSelector(selectLearnersTabEnabled);

/**
 * React hook that gets the current topic ID from the current topic or category.
 * The topicId in the DiscussionContext only return the direct topicId from the URL.
 * If the URL has the current block ID it cannot get the topicID from that. This hook
 * gets the topic ID from the URL if available, or from the current category otherwise.
 * It only returns an ID if a single ID is available, if navigating a subsection it
 * returns null.
 * @returns {null|string} A topic ID if a single one available in the current context.
 */
export const useCurrentDiscussionTopic = () => {
  const { topicId, category } = useContext(DiscussionContext);
  const topics = useSelector(selectTopicsUnderCategory)(category);
  if (topicId) {
    return topicId;
  }
  if (topics?.length === 1) {
    return topics[0];
  }
  return null;
};
