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
  selectCommentSortOrder, selectDraftComments, selectDraftResponses,
  selectThreadComments, selectThreadCurrentPage, selectThreadHasMorePages,
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

export const useDraftContent = () => {
  const comments = useSelector(selectDraftComments);
  const responses = useSelector(selectDraftResponses);

  const getObjectByParentId = (data, parentId, isComment, id) => Object.values(data)
    .find(draft => (isComment ? draft.parentId === parentId && (id ? draft.id === id : draft.isNewContent === true)
      : draft.threadId === parentId && (id ? draft.id === id : draft.isNewContent === true)));

  const updateDraftData = (draftData, newDraftObject) => ({
    ...draftData,
    [newDraftObject.id]: newDraftObject,
  });

  const addDraftContent = (content, parentId, id, threadId) => {
    const data = parentId ? comments : responses;
    const draftParentId = parentId || threadId;
    const isComment = !!parentId;
    const existingObj = getObjectByParentId(data, draftParentId, isComment, id);
    const newObject = existingObj
      ? { ...existingObj, content }
      : {
        threadId,
        content,
        parentId,
        id: id || uuidv4(),
        isNewContent: !id,
      };

    const updatedComments = parentId ? updateDraftData(comments, newObject) : comments;
    const updatedResponses = !parentId ? updateDraftData(responses, newObject) : responses;

    return { updatedComments, updatedResponses };
  };

  const getDraftContent = (parentId, threadId, id) => {
    if (id) {
      return parentId ? comments?.[id]?.content : responses?.[id]?.content;
    }

    const data = parentId ? comments : responses;
    const draftParentId = parentId || threadId;
    const isComment = !!parentId;

    return getObjectByParentId(data, draftParentId, isComment, id)?.content;
  };

  const removeItem = (draftData, objId) => {
    const { [objId]: _, ...newDraftData } = draftData;
    return newDraftData;
  };

  const updateContent = (items, itemId, parentId, isComment) => {
    const itemObj = itemId ? items[itemId] : getObjectByParentId(items, parentId, isComment, itemId);
    return itemObj ? removeItem(items, itemObj.id) : items;
  };

  const removeDraftContent = (parentId, id, threadId) => {
    const updatedResponses = !parentId ? updateContent(responses, id, threadId, false) : responses;
    const updatedComments = parentId ? updateContent(comments, id, parentId, true) : comments;

    return { updatedResponses, updatedComments };
  };

  return {
    addDraftContent,
    getDraftContent,
    removeDraftContent,
  };
};
