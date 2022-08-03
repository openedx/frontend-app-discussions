import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@edx/paragon';

import { EndorsementStatus, ThreadType } from '../../data/constants';
import { useDispatchWithState } from '../../data/hooks';
import { Post } from '../posts';
import { selectThread } from '../posts/data/selectors';
import { fetchThread, markThreadAsRead } from '../posts/data/thunks';
import { selectThreadComments, selectThreadCurrentPage, selectThreadHasMorePages } from './data/selectors';
import { fetchThreadComments } from './data/thunks';
import { Comment, ResponseEditor } from './comment';
import messages from './messages';

function usePost(postId) {
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));

  useEffect(() => {
    if (thread && !thread.read) {
      dispatch(markThreadAsRead(postId));
    }
  }, [postId]);

  return thread;
}

function usePostComments(postId, endorsed = null) {
  const [isLoading, dispatch] = useDispatchWithState();
  const comments = useSelector(selectThreadComments(postId, endorsed));
  const hasMorePages = useSelector(selectThreadHasMorePages(postId, endorsed));
  const currentPage = useSelector(selectThreadCurrentPage(postId, endorsed));
  const handleLoadMoreResponses = async () => dispatch(fetchThreadComments(postId, {
    endorsed,
    page: currentPage + 1,
  }));
  useEffect(() => {
    dispatch(fetchThreadComments(postId, {
      endorsed,
      page: 1,
    }));
  }, [postId]);
  return {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  };
}

function DiscussionCommentsView({
  postType,
  postId,
  intl,
  endorsed,
}) {
  const {
    comments,
    hasMorePages,
    isLoading,
    handleLoadMoreResponses,
  } = usePostComments(postId, endorsed);
  return (
    <>
      <div className="mx-4 text-primary-700" role="heading" aria-level="2" style={{ lineHeight: '28px' }}>
        {endorsed === EndorsementStatus.ENDORSED
          ? intl.formatMessage(messages.endorsedResponseCount, { num: comments.length })
          : intl.formatMessage(messages.responseCount, { num: comments.length })}
      </div>
      <div className="mx-4" role="list">
        {comments.map(comment => (
          <Comment comment={comment} key={comment.id} postType={postType} />
        ))}

        {hasMorePages && !isLoading && (
          <Button
            onClick={handleLoadMoreResponses}
            variant="link"
            block="true"
            className="card p-4"
            data-testid="load-more-comments"
          >
            {intl.formatMessage(messages.loadMoreResponses)}
          </Button>
        )}
        {isLoading
        && (
          <div className="card my-4 p-4 d-flex align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </div>
    </>

  );
}

DiscussionCommentsView.propTypes = {
  postId: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  endorsed: PropTypes.oneOf([
    EndorsementStatus.ENDORSED, EndorsementStatus.UNENDORSED, EndorsementStatus.DISCUSSION,
  ]).isRequired,
};

function CommentsView({ intl }) {
  const { postId } = useParams();
  const thread = usePost(postId);
  const dispatch = useDispatch();
  if (!thread) {
    dispatch(fetchThread(postId, true));
    return (
      <Spinner animation="border" variant="primary" data-testid="loading-indicator" />
    );
  }
  return (
    <>
      <div className="discussion-comments d-flex flex-column m-4 p-4.5 card">
        <Post post={thread} />
        <ResponseEditor postId={postId} />
      </div>
      {thread.type === ThreadType.DISCUSSION
        && (
        <DiscussionCommentsView
          postId={postId}
          intl={intl}
          postType={thread.type}
          endorsed={EndorsementStatus.DISCUSSION}
        />
        )}
      {thread.type === ThreadType.QUESTION && (
        <>
          <DiscussionCommentsView
            postId={postId}
            intl={intl}
            postType={thread.type}
            endorsed={EndorsementStatus.ENDORSED}
          />
          <DiscussionCommentsView
            postId={postId}
            intl={intl}
            postType={thread.type}
            endorsed={EndorsementStatus.UNENDORSED}
          />
        </>
      )}
    </>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentsView);
