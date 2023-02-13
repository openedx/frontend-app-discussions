import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { EndorsementStatus } from '../../../data/constants';
import { useDispatchWithState } from '../../../data/hooks';
import { selectThread } from '../../posts/data/selectors';
import { markThreadAsRead } from '../../posts/data/thunks';
import {
  selectCommentSortOrder, selectThreadComments, selectThreadCurrentPage, selectThreadHasMorePages,
} from './selectors';
import { fetchThreadComments } from './thunks';

export function usePost(postId) {
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));

  useEffect(() => {
    if (thread && !thread.read) {
      dispatch(markThreadAsRead(postId));
    }
  }, [postId]);

  return thread;
}

export function usePostComments(postId, endorsed = null) {
  const [isLoading, dispatch] = useDispatchWithState();
  const comments = useSelector(selectThreadComments(postId, endorsed));
  const reverseOrder = useSelector(selectCommentSortOrder);
  const hasMorePages = useSelector(selectThreadHasMorePages(postId, endorsed));
  const currentPage = useSelector(selectThreadCurrentPage(postId, endorsed));

  const handleLoadMoreResponses = async () => dispatch(fetchThreadComments(postId, {
    endorsed,
    page: currentPage + 1,
    reverseOrder,
  }));

  useEffect(() => {
    dispatch(fetchThreadComments(postId, {
      endorsed,
      page: 1,
      reverseOrder,
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

  return [...discussions, ...endorsedQuestions, ...unendorsedQuestions].length;
}
