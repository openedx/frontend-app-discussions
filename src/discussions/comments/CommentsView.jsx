import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@edx/paragon';

import { Post } from '../posts';
import { selectThread } from '../posts/data/selectors';
import { markThreadAsRead } from '../posts/data/thunks';
import {
  selectThreadComments,
  selectThreadCurrentPage,
  selectThreadHasMorePages,
} from './data/selectors';
import { fetchThreadComments } from './data/thunks';
import { Comment, ResponseEditor } from './comment';
import messages from './messages';

ensureConfig(['POST_MARK_AS_READ_DELAY'], 'Comment thread view');

function CommentsView({ intl }) {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));
  const comments = useSelector(selectThreadComments(postId));
  const hasMorePages = useSelector(selectThreadHasMorePages(postId));
  const currentPage = useSelector(selectThreadCurrentPage(postId));
  const handleLoadMoreComments = () => dispatch(fetchThreadComments(postId, { page: currentPage + 1 }));
  useEffect(() => {
    if (!currentPage) {
      dispatch(fetchThreadComments(postId, { page: 1 }));
    }
    const markReadTimer = setTimeout(() => {
      if (thread && !thread.read) {
        dispatch(markThreadAsRead(postId));
      }
    }, getConfig().POST_MARK_AS_READ_DELAY);
    return () => {
      clearTimeout(markReadTimer);
    };
  }, [postId]);
  if (!thread) {
    return (
      <Spinner animation="border" variant="primary" />
    );
  }
  return (
    <div className="discussion-comments d-flex flex-column w-100 ml-3">
      <div className="mb-2">
        <Post post={thread} />
        {comments.length > 0
        && (
          <div className="my-3">
            <ResponseEditor postId={postId} />
          </div>
        )}
        <div className="card">
          {comments.map(comment => (
            <div key={comment.id} className="border-bottom">
              <Comment comment={comment} />
            </div>
          ))}
          {hasMorePages && (
            <div className="list-group-item list-group-item-action">
              <Button
                onClick={handleLoadMoreComments}
                variant="link"
                block="true"
              >
                {intl.formatMessage(messages.loadMoreComments)}
              </Button>
            </div>
          )}
        </div>
      </div>
      <ResponseEditor postId={postId} />
    </div>
  );
}

CommentsView.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentsView);
