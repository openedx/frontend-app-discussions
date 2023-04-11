import {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { EndorsementStatus } from '../../../data/constants';
import { useDispatchWithState } from '../../../data/hooks';
import { DiscussionContext } from '../../common/context';
import { selectThread } from '../../posts/data/selectors';
import { markThreadAsRead } from '../../posts/data/thunks';
import {
  selectCommentSortOrder, selectThreadComments, selectThreadCurrentPage, selectThreadHasMorePages,
} from './selectors';
import { fetchThreadComments } from './thunks';

const trackLoadMoreEvent = (postId, params) => (
  sendTrackEvent(
    'edx.forum.responses.loadMore',
    {
      postId,
      params,
    },
  )
);

export function usePost(postId) {
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));

  useEffect(() => {
    if (thread && !thread.read) {
      dispatch(markThreadAsRead(postId));
    }
  }, [postId]);

  return thread || {};
}

export function usePostComments(postId, endorsed = null) {
  const [isLoading, dispatch] = useDispatchWithState();
  const comments = useSelector(selectThreadComments(postId, endorsed));
  const reverseOrder = useSelector(selectCommentSortOrder);
  const hasMorePages = useSelector(selectThreadHasMorePages(postId, endorsed));
  const currentPage = useSelector(selectThreadCurrentPage(postId, endorsed));
  const { enableInContextSidebar } = useContext(DiscussionContext);

  const handleLoadMoreResponses = useCallback(async () => {
    const params = {
      endorsed,
      page: currentPage + 1,
      reverseOrder,
    };
    await dispatch(fetchThreadComments(postId, params));
    trackLoadMoreEvent(postId, params);
  }, [currentPage, endorsed, postId, reverseOrder]);

  useEffect(() => {
    dispatch(fetchThreadComments(postId, {
      endorsed,
      page: 1,
      reverseOrder,
      enableInContextSidebar,
    }));
  }, [postId, reverseOrder]);

  return {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  };
}

export function useCommentsCount(postId) {
  const discussions = useSelector(selectThreadComments(postId, EndorsementStatus.DISCUSSION));
  const endorsedQuestions = useSelector(selectThreadComments(postId, EndorsementStatus.ENDORSED));
  const unendorsedQuestions = useSelector(selectThreadComments(postId, EndorsementStatus.UNENDORSED));

  const commentsLength = useMemo(() => (
    [...discussions, ...endorsedQuestions, ...unendorsedQuestions].length
  ), [discussions, endorsedQuestions, unendorsedQuestions]);

  return commentsLength;
}
