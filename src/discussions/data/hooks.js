import {
  useCallback,
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { breakpoints, useWindowSize } from '@edx/paragon';

import { RequestStatus, Routes } from '../../data/constants';
import { selectTopicsUnderCategory } from '../../data/selectors';
import { fetchCourseBlocks } from '../../data/thunks';
import { DiscussionContext } from '../common/context';
import { clearRedirect } from '../posts/data';
import { threadsLoadingStatus } from '../posts/data/selectors';
import { selectTopics } from '../topics/data/selectors';
import tourCheckpoints from '../tours/constants';
import { selectTours } from '../tours/data/selectors';
import { updateTourShowStatus } from '../tours/data/thunks';
import messages from '../tours/messages';
import { discussionsPath, inBlackoutDateRange } from '../utils';
import {
  selectAreThreadsFiltered,
  selectBlackoutDate,
  selectEnableInContext,
  selectIsCourseAdmin,
  selectIsCourseStaff,
  selectLearnersTabEnabled,
  selectModerationSettings,
  selectPostThreadCount,
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
  selectUserIsStaff,
} from './selectors';
import { fetchCourseConfig } from './thunks';

export function useTotalTopicThreadCount() {
  const topics = useSelector(selectTopics);
  const count = useMemo(() => (
    Object.keys(topics)?.reduce((total, topicId) => {
      const topic = topics[topicId];
      return total + topic.threadCounts.discussion + topic.threadCounts.question;
    }, 0)),
  []);

  return count;
}

export const useSidebarVisible = () => {
  const enableInContext = useSelector(selectEnableInContext);
  const isViewingTopics = useRouteMatch(Routes.TOPICS.ALL);
  const isViewingLearners = useRouteMatch(Routes.LEARNERS.PATH);
  const isFiltered = useSelector(selectAreThreadsFiltered);
  const totalThreads = useSelector(selectPostThreadCount);
  const isThreadsEmpty = Boolean(useSelector(threadsLoadingStatus()) === RequestStatus.SUCCESSFUL && !totalThreads);
  const isIncontextTopicsView = Boolean(useRouteMatch(Routes.TOPICS.PATH) && enableInContext);
  const hideSidebar = Boolean(isThreadsEmpty && !isFiltered && !(isViewingTopics?.isExact || isViewingLearners));

  if (isIncontextTopicsView) {
    return true;
  }

  return !hideSidebar;
};

export function useCourseDiscussionData(courseId) {
  const dispatch = useDispatch();
  const { authenticatedUser } = useContext(AppContext);

  useEffect(() => {
    async function fetchBaseData() {
      await dispatch(fetchCourseConfig(courseId));
      await dispatch(fetchCourseBlocks(courseId, authenticatedUser.username));
    }

    fetchBaseData();
  }, [courseId]);
}

export function useRedirectToThread(courseId, enableInContextSidebar) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const redirectToThread = useSelector(
    (state) => state.threads.redirectToThread,
  );

  useEffect(() => {
    // After posting a new thread we'd like to redirect users to it, the topic and post id are temporarily
    // stored in redirectToThread
    if (redirectToThread) {
      dispatch(clearRedirect());
      const newLocation = discussionsPath(Routes.COMMENTS.PAGES[enableInContextSidebar ? 'topics' : 'my-posts'], {
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
  return windowSize.width >= breakpoints.medium.minWidth;
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
    window.requestAnimationFrame(() => {
      if (refContainer?.current) {
        setHeight(refContainer?.current?.clientHeight);
      }
    });
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

export const useAlertBannerVisible = (
  {
    author, abuseFlagged, lastEdit, closed,
  } = {},
) => {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === author;
  const canSeeLastEditOrClosedAlert = (userHasModerationPrivileges || userIsContentAuthor || userIsGroupTa);
  const canSeeReportedBanner = abuseFlagged;

  return (
    (reasonCodesEnabled && canSeeLastEditOrClosedAlert && (lastEdit?.reason || closed)) || (canSeeReportedBanner)
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

export const useUserCanAddThreadInBlackoutDate = () => {
  const blackoutDateRange = useSelector(selectBlackoutDate);
  const isUserAdmin = useSelector(selectUserIsStaff);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const isUserGroupTA = useSelector(selectUserIsGroupTa);
  const isCourseAdmin = useSelector(selectIsCourseAdmin);
  const isCourseStaff = useSelector(selectIsCourseStaff);
  const isPrivileged = isUserAdmin || userHasModerationPrivileges || isUserGroupTA || isCourseAdmin || isCourseStaff;
  const isInBlackoutDateRange = useMemo(() => inBlackoutDateRange(blackoutDateRange), [blackoutDateRange]);

  return (!(isInBlackoutDateRange) || (isPrivileged));
};

function camelToConstant(string) {
  return string.replace(/[A-Z]/g, (match) => `_${match}`).toUpperCase();
}

export const useTourConfiguration = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const tours = useSelector(selectTours);

  const handleOnDismiss = useCallback((id) => (
    dispatch(updateTourShowStatus(id))
  ), []);

  const handleOnEnd = useCallback((id) => (
    dispatch(updateTourShowStatus(id))
  ), []);

  const toursConfig = useMemo(() => (
    tours.map((tour) => (
      {
        tourId: tour.tourName,
        advanceButtonText: intl.formatMessage(messages.advanceButtonText),
        dismissButtonText: intl.formatMessage(messages.dismissButtonText),
        endButtonText: intl.formatMessage(messages.endButtonText),
        enabled: tour && Boolean(tour.enabled && tour.showTour && !enableInContextSidebar),
        onDismiss: handleOnDismiss(tour.id),
        onEnd: handleOnEnd(tour.id),
        checkpoints: tourCheckpoints(intl)[camelToConstant(tour.tourName)],
      }
    ))
  ), [tours, enableInContextSidebar]);

  return toursConfig;
};

export const useDebounce = (value, delay) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
};
