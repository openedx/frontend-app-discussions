import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { Spinner } from '@edx/paragon';

import { Post } from '../posts';
import { selectThread } from '../posts/data/selectors';
import { markThreadAsRead } from '../posts/data/thunks';
import { selectThreadComments } from './data/selectors';
import { fetchThreadComments } from './data/thunks';
import { Comment, ResponseEditor } from './comment';

ensureConfig(['POST_MARK_AS_READ_DELAY'], 'Comment thread view');

function CommentsView() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const thread = useSelector(selectThread(postId));
  const comments = useSelector(selectThreadComments(postId));

  useEffect(() => {
    dispatch(fetchThreadComments(postId));
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
        </div>
      </div>
      <ResponseEditor postId={postId} />
    </div>
  );
}

CommentsView.propTypes = {};

export default CommentsView;
