import {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { EndorsementStatus } from '../../../data/constants';
import useDispatchWithState from '../../../data/hooks';
import DiscussionContext from '../../common/context';
import { selectThread } from '../../posts/data/selectors';
import { markThreadAsRead } from '../../posts/data/thunks';
import { filterPosts } from '../../utils';
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

export function usePostComments(threadType) {
  const { enableInContextSidebar, postId } = useContext(DiscussionContext);
  const [isLoading, dispatch] = useDispatchWithState();
  const comments = useSelector(selectThreadComments(postId));
  const reverseOrder = useSelector(selectCommentSortOrder);
  const hasMorePages = useSelector(selectThreadHasMorePages(postId));
  const currentPage = useSelector(selectThreadCurrentPage(postId));

  const endorsedCommentsIds = useMemo(() => (
    [...filterPosts(comments, 'endorsed')].map(comment => comment.id)
  ), [comments]);

  const unEndorsedCommentsIds = useMemo(() => (
    [...filterPosts(comments, 'unendorsed')].map(comment => comment.id)
  ), [comments]);

  const handleLoadMoreResponses = useCallback(async () => {
    const params = {
      threadType,
      page: currentPage + 1,
      reverseOrder,
    };
    await dispatch(fetchThreadComments(postId, params));
    trackLoadMoreEvent(postId, params);
  }, [currentPage, threadType, postId, reverseOrder]);

  useEffect(() => {
    const abortController = new AbortController();

    dispatch(fetchThreadComments(postId, {
      threadType,
      page: 1,
      reverseOrder,
      enableInContextSidebar,
      signal: abortController.signal,
    }));

    return () => {
      abortController.abort();
    };
  }, [postId, threadType, reverseOrder, enableInContextSidebar]);

  return {
    endorsedCommentsIds,
    unEndorsedCommentsIds,
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

export const getObjectById = (draftList, id, isComment) => Object.values(draftList)
  .find(draft => (isComment ? draft.parentId === id : draft.threadId === id));

export const useRemoveDraftContent = (responses, comments, parentId, id, threadId) => {
  const updatedResponses = { ...responses };
  const updatedComments = { ...comments };

  if (!parentId) {
    const responseObj = id ? updatedResponses[id] : getObjectById(responses, threadId, false);
    delete updatedResponses[responseObj.id];
  } else {
    const commentObj = id ? updatedComments[id] : getObjectById(comments, parentId, true);
    delete updatedComments[commentObj.id];
  }

  return { updatedResponses, updatedComments };
};

const updateDraftList = (draftList, newDraftObject) => ({
  ...draftList,
  [newDraftObject.id]: newDraftObject,
});

export const useAddDraftContent = (content, responses, comments, parentId, id, threadId) => {
  let updatedResponses = { ...responses };
  let updatedComments = { ...comments };

  const newObject = {
    threadId, content, parentId, id: id || uuidv4(),
  };

  if (!parentId) {
    updatedResponses = updateDraftList(responses, newObject);
  } else {
    updatedComments = updateDraftList(comments, newObject);
  }

  return { updatedResponses, updatedComments };
};
